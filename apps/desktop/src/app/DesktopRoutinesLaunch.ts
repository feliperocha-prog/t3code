import * as Clock from "effect/Clock";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Ref from "effect/Ref";
import * as Schema from "effect/Schema";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";

import * as DesktopBackendPool from "../backend/DesktopBackendPool.ts";
import * as DesktopLocalEnvironmentAuth from "../backend/DesktopLocalEnvironmentAuth.ts";
import * as ElectronApp from "../electron/ElectronApp.ts";
import * as DesktopWindow from "../window/DesktopWindow.ts";
import * as DesktopState from "./DesktopState.ts";

const ACTIVITY_PATH = "/api/scheduled-routines/activity";
const POLL_INTERVAL = Duration.seconds(30);
// A routine waiting forever (stuck provider, endless tool loop) must not keep
// a hidden app alive for days.
const MAX_HIDDEN_RUN = Duration.hours(3);

const Activity = Schema.Struct({ busy: Schema.Boolean });

/**
 * While the app was opened only for routines, polls the local server and quits
 * after it reports idle twice in a row. Opening the app normally in the
 * meantime shows the window and ends the watch.
 */
export const watchRoutinesLaunch = Effect.gen(function* () {
  const state = yield* DesktopState.DesktopState;
  if (!(yield* Ref.get(state.routinesOnly))) return;
  const electronApp = yield* ElectronApp.ElectronApp;
  const desktopWindow = yield* DesktopWindow.DesktopWindow;
  const pool = yield* DesktopBackendPool.DesktopBackendPool;
  const localAuth = yield* DesktopLocalEnvironmentAuth.DesktopLocalEnvironmentAuth;
  const httpClient = yield* HttpClient.HttpClient;
  const runPromise = Effect.runPromiseWith(yield* Effect.context<DesktopWindow.DesktopWindow>());

  yield* electronApp.on("second-instance", (_event: unknown, argv: readonly string[]) => {
    if (argv?.includes(DesktopState.ROUTINES_LAUNCH_ARG)) return;
    // createMain clears routinesOnly, so the watch below stops.
    void runPromise(desktopWindow.revealOrCreateMain.pipe(Effect.ignoreCause));
  });

  const busy = Effect.gen(function* () {
    const primary = yield* pool.primary;
    const config = yield* primary.currentConfig;
    if (Option.isNone(config)) return true;
    const token = yield* localAuth.getBearerToken;
    const response = yield* httpClient.execute(
      HttpClientRequest.get(new URL(ACTIVITY_PATH, config.value.httpBaseUrl)).pipe(
        HttpClientRequest.bearerToken(token),
      ),
    );
    const activity = yield* HttpClientResponse.schemaBodyJson(Activity)(response);
    return activity.busy;
  }).pipe(
    // The backend may still be booting; treat any failure as still busy.
    Effect.timeout(Duration.seconds(10)),
    Effect.catchCause(() => Effect.succeed(true)),
  );

  const startedAt = yield* Clock.currentTimeMillis;
  let idleChecks = 0;
  while (true) {
    yield* Effect.sleep(POLL_INTERVAL);
    if (!(yield* Ref.get(state.routinesOnly)) || (yield* Ref.get(state.quitting))) return;
    idleChecks = (yield* busy) ? 0 : idleChecks + 1;
    const elapsed = (yield* Clock.currentTimeMillis) - startedAt;
    if (idleChecks >= 2 || elapsed >= Duration.toMillis(MAX_HIDDEN_RUN)) {
      if (!(yield* Ref.get(state.routinesOnly))) return;
      yield* Effect.logInfo("routines finished; quitting the hidden app");
      yield* electronApp.quit;
      return;
    }
  }
}).pipe(Effect.withSpan("desktop.routinesLaunch.watch"));
