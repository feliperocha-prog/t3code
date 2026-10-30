import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Ref from "effect/Ref";

/**
 * The Windows task the server registers for scheduled routines opens the app
 * with this argument: no window, run what is due, quit when it is done.
 */
export const ROUTINES_LAUNCH_ARG = "--t3-routines";

export class DesktopState extends Context.Service<
  DesktopState,
  {
    readonly backendReady: Ref.Ref<boolean>;
    readonly quitting: Ref.Ref<boolean>;
    /**
     * Opened by the scheduled routines task: no window until the user opens the
     * app, which clears this. See DesktopRoutinesLaunch.
     */
    readonly routinesOnly: Ref.Ref<boolean>;
  }
>()("@t3tools/desktop/app/DesktopState") {}

const make = Effect.all({
  backendReady: Ref.make(false),
  quitting: Ref.make(false),
  routinesOnly: Ref.make(process.argv.includes(ROUTINES_LAUNCH_ARG)),
});

export const layer = Layer.effect(DesktopState, make);
