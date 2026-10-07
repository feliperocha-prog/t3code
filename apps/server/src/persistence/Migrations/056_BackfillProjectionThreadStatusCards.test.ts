import { assert, it } from "@effect/vitest";
import { MessageId, ThreadStatusCard } from "@t3tools/contracts";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as SqlClient from "effect/unstable/sql/SqlClient";
import * as NodeSqliteClient from "@t3tools/shared/nodeSqliteClient";

import { runMigrations } from "../Migrations.ts";
import backfillStatusCards from "./056_BackfillProjectionThreadStatusCards.ts";

const decodeCard = Schema.decodeUnknownSync(Schema.fromJsonString(ThreadStatusCard));
const encodeCard = Schema.encodeSync(Schema.fromJsonString(ThreadStatusCard));

const reply = (status: string) => `Feito.\n\nSTATUS: ${status}\nVOCÊ: testar\nEU: nada`;

it.layer(NodeSqliteClient.layer({ filename: ":memory:" }))(
  "056_BackfillProjectionThreadStatusCards",
  (it) => {
    it.effect("fills missing cards from each thread's latest completed reply", () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* runMigrations({ toMigrationInclusive: 55 });

        const insertThread = (threadId: string, statusCard: string | null) => sql`
          INSERT INTO projection_threads (
            thread_id, project_id, title, model_selection_json, runtime_mode,
            created_at, updated_at, status_card_json
          ) VALUES (
            ${threadId}, 'project-1', 'Thread',
            '{"instanceId":"codex","model":"gpt-5.4"}', 'full-access',
            '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', ${statusCard}
          )
        `;
        const insertMessage = (input: {
          readonly messageId: string;
          readonly threadId: string;
          readonly role: string;
          readonly text: string;
          readonly streaming?: boolean;
          readonly at: string;
        }) => sql`
          INSERT INTO projection_thread_messages (
            message_id, thread_id, turn_id, role, text, is_streaming, created_at, updated_at
          ) VALUES (
            ${input.messageId}, ${input.threadId}, NULL, ${input.role}, ${input.text},
            ${input.streaming === true ? 1 : 0}, ${input.at}, ${input.at}
          )
        `;

        // Latest completed reply wins over an older one, a newer user message
        // and a reply still streaming; ties on time fall to the higher id.
        yield* insertThread("thread-latest", null);
        yield* insertMessage({
          messageId: "a-1",
          threadId: "thread-latest",
          role: "assistant",
          text: reply("bloqueado"),
          at: "2026-01-01T00:01:00.000Z",
        });
        yield* insertMessage({
          messageId: "a-2",
          threadId: "thread-latest",
          role: "assistant",
          text: reply("bloqueado"),
          at: "2026-01-01T00:02:00.000Z",
        });
        yield* insertMessage({
          messageId: "a-3",
          threadId: "thread-latest",
          role: "assistant",
          text: reply("aguardando sua aprovação"),
          at: "2026-01-01T00:02:00.000Z",
        });
        yield* insertMessage({
          messageId: "u-1",
          threadId: "thread-latest",
          role: "user",
          text: reply("pronto"),
          at: "2026-01-01T00:03:00.000Z",
        });
        yield* insertMessage({
          messageId: "a-4",
          threadId: "thread-latest",
          role: "assistant",
          text: reply("pronto"),
          streaming: true,
          at: "2026-01-01T00:04:00.000Z",
        });

        // The latest reply has no status block, so the thread has no card,
        // even though an older reply had one.
        yield* insertThread("thread-plain", null);
        yield* insertMessage({
          messageId: "b-1",
          threadId: "thread-plain",
          role: "assistant",
          text: reply("pronto"),
          at: "2026-01-01T00:01:00.000Z",
        });
        yield* insertMessage({
          messageId: "b-2",
          threadId: "thread-plain",
          role: "assistant",
          text: "Sem bloco de status.",
          at: "2026-01-01T00:02:00.000Z",
        });

        // A card the projector already wrote stays as it is.
        const existingCard = encodeCard({
          kind: "pronto",
          status: "pronto",
          voce: "nada",
          eu: "nada",
          messageId: MessageId.make("c-1"),
        });
        yield* insertThread("thread-carded", existingCard);
        yield* insertMessage({
          messageId: "c-2",
          threadId: "thread-carded",
          role: "assistant",
          text: reply("bloqueado"),
          at: "2026-01-01T00:02:00.000Z",
        });

        yield* insertThread("thread-empty", null);

        yield* runMigrations({ toMigrationInclusive: 56 });

        const selectCards = sql<{
          readonly threadId: string;
          readonly statusCard: string | null;
          readonly updatedAt: string;
        }>`
          SELECT thread_id AS "threadId", status_card_json AS "statusCard", updated_at AS "updatedAt"
          FROM projection_threads ORDER BY thread_id
        `;
        const rows = yield* selectCards;
        const cards = Object.fromEntries(rows.map((row) => [row.threadId, row.statusCard]));

        assert.deepEqual(decodeCard(cards["thread-latest"]), {
          kind: "aguardando",
          status: "aguardando sua aprovação",
          voce: "testar",
          eu: "nada",
          messageId: "a-3",
        });
        assert.equal(cards["thread-plain"], null);
        assert.equal(cards["thread-carded"], existingCard);
        assert.equal(cards["thread-empty"], null);
        // A backfill is not activity: the sidebar order stays as it was.
        assert.deepEqual(
          rows.map((row) => row.updatedAt),
          rows.map(() => "2026-01-01T00:00:00.000Z"),
        );

        // Running it again changes nothing.
        yield* backfillStatusCards;
        assert.deepEqual(yield* selectCards, rows);
      }),
    );
  },
);
