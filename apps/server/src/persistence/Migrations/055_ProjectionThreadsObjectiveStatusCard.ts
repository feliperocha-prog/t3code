import * as Effect from "effect/Effect";
import * as SqlClient from "effect/unstable/sql/SqlClient";

// Existing threads start without an objective or status card; the next
// assistant reply or title generation fills them.
export default Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const columns = yield* sql<{ readonly name: string }>`
    PRAGMA table_info(projection_threads)
  `;
  const has = (name: string) => columns.some((column) => column.name === name);
  if (!has("objective")) {
    yield* sql`
      ALTER TABLE projection_threads
      ADD COLUMN objective TEXT
    `;
  }
  if (!has("objective_state_json")) {
    yield* sql`
      ALTER TABLE projection_threads
      ADD COLUMN objective_state_json TEXT
    `;
  }
  if (!has("status_card_json")) {
    yield* sql`
      ALTER TABLE projection_threads
      ADD COLUMN status_card_json TEXT
    `;
  }
});
