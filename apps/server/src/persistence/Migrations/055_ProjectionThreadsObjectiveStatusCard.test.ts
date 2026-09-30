import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as SqlClient from "effect/unstable/sql/SqlClient";
import * as NodeSqliteClient from "@t3tools/shared/nodeSqliteClient";

import { runMigrations } from "../Migrations.ts";
import migrateObjectiveStatusCard from "./055_ProjectionThreadsObjectiveStatusCard.ts";

interface ObjectiveStatusCardRow {
  readonly objective: string | null;
  readonly objectiveState: string | null;
  readonly statusCard: string | null;
}

it.layer(NodeSqliteClient.layer({ filename: ":memory:" }))(
  "055_ProjectionThreadsObjectiveStatusCard",
  (it) => {
    it.effect("adds empty objective and status card columns for existing threads", () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* runMigrations({ toMigrationInclusive: 54 });
        const now = "2026-01-01T00:00:00.000Z";
        yield* sql`
        INSERT INTO projection_threads (
          thread_id, project_id, title, model_selection_json, runtime_mode,
          created_at, updated_at
        ) VALUES (
          'thread-1', 'project-1', 'Existing thread',
          '{"instanceId":"codex","model":"gpt-5.4"}', 'full-access', ${now}, ${now}
        )
      `;
        yield* runMigrations({ toMigrationInclusive: 55 });
        const selectRow = sql<ObjectiveStatusCardRow>`
        SELECT
          objective,
          objective_state_json AS "objectiveState",
          status_card_json AS "statusCard"
        FROM projection_threads WHERE thread_id = 'thread-1'
      `;
        assert.deepEqual(yield* selectRow, [
          { objective: null, objectiveState: null, statusCard: null },
        ]);
        // Re-running against a database that already has the columns keeps their values.
        yield* sql`
        UPDATE projection_threads
        SET objective = 'Goal', objective_state_json = '{"source":"manual"}', status_card_json = '{}'
        WHERE thread_id = 'thread-1'
      `;
        yield* migrateObjectiveStatusCard;
        assert.deepEqual(yield* selectRow, [
          { objective: "Goal", objectiveState: '{"source":"manual"}', statusCard: "{}" },
        ]);
      }),
    );
  },
);
