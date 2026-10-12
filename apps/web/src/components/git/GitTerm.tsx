import { Term } from "../ui-terms/Term";
import type { GitTermName } from "./gitTerms";

export { gitTermLabel, gitTermSimple } from "./gitTerms";

/** A git word in the bilingual vocabulary; see `Term` for the variants. */
export function GitTerm({
  term,
  variant = "inline",
}: {
  term: GitTermName;
  variant?: "inline" | "plain" | "technical";
}) {
  return <Term term={term} variant={variant} />;
}
