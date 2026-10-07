import { parseStatusCard } from "@t3tools/shared/statusCard";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as SqlClient from "effect/unstable/sql/SqlClient";

// The card as the projector stores it, frozen here so later schema changes leave
// this migration alone.
const encodeStatusCard = Schema.encodeSync(
  Schema.fromJsonString(
    Schema.Struct({
      kind: Schema.String,
      status: Schema.String,
      voce: Schema.String,
      eu: Schema.String,
      messageId: Schema.String,
    }),
  ),
);

// 055 left every existing thread without a status card until its next reply.
// Fill it the way the projector does: from the latest completed assistant
// reply, ordered like the message list, or no card when that reply has none.
export default Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;
  const replies = yield* sql<{
    readonly threadId: string;
    readonly messageId: string;
    readonly text: string;
  }>`
    SELECT
      latest.thread_id AS "threadId",
      latest.message_id AS "messageId",
      message.text
    FROM (
      SELECT
        thread_id,
        message_id,
        ROW_NUMBER() OVER (
          PARTITION BY thread_id
          ORDER BY created_at DESC, message_id DESC
        ) AS row_number
      FROM projection_thread_messages
      WHERE role = 'assistant'
        AND is_streaming = 0
        AND thread_id IN (
          SELECT thread_id FROM projection_threads WHERE status_card_json IS NULL
        )
    ) AS latest
    INNER JOIN projection_thread_messages AS message
      ON message.message_id = latest.message_id
    WHERE latest.row_number = 1
  `;

  for (const reply of replies) {
    const card = parseStatusCard(reply.text);
    if (card === null) continue;
    yield* sql`
      UPDATE projection_threads
      SET status_card_json = ${encodeStatusCard({ ...card, messageId: reply.messageId })}
      WHERE thread_id = ${reply.threadId}
        AND status_card_json IS NULL
    `;
  }
});
