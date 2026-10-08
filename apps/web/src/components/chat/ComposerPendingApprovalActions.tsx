import {
  type ApprovalRequestId,
  type ProviderApprovalDecision,
  type ProviderApprovalOption,
} from "@t3tools/contracts";
import { memo } from "react";
import { EllipsisIcon, TriangleAlertIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "../ui/menu";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import { composerFloatingLayerProps } from "./composerEventScope";
import { t, tc } from "~/i18n";

interface ComposerPendingApprovalActionsProps {
  requestId: ApprovalRequestId;
  isResponding: boolean;
  options?: ReadonlyArray<ProviderApprovalOption> | undefined;
  onRespondToApproval: (
    requestId: ApprovalRequestId,
    decision: ProviderApprovalDecision,
  ) => Promise<unknown>;
}

const DEFAULT_APPROVAL_OPTIONS = [
  { decision: "cancel", label: "Cancel" },
  { decision: "decline", label: "Decline" },
  { decision: "acceptForSession", label: "Always allow this session" },
  { decision: "accept", label: "Approve" },
] satisfies ReadonlyArray<ProviderApprovalOption>;

// The generic wording (ours and the providers') gets plain names; a provider's
// own wording, such as "Allow once" or "Always allow Safari", is kept as sent.
const PLAIN_APPROVAL_LABELS: Readonly<Record<string, string>> = {
  Cancel: t("Cancel"),
  Decline: tc("approval", "Deny"),
  Approve: tc("approval", "Allow"),
  "Always allow this session": tc("approval", "Allow for this conversation"),
};

const approvalOptionLabel = (option: ProviderApprovalOption) =>
  PLAIN_APPROVAL_LABELS[option.label] ?? option.label;

// Allowing for the rest of the conversation is a standing decision, so its
// scope is spelled out unless the provider already attached a warning.
const approvalOptionHint = (option: ProviderApprovalOption) =>
  option.warning ??
  (option.decision === "acceptForSession"
    ? tc(
        "approval",
        "Allows this kind of request until the conversation ends. Other requests still ask.",
      )
    : undefined);

const isPrimaryDecision = (option: ProviderApprovalOption) =>
  option.decision === "decline" ||
  option.decision === "acceptForSession" ||
  option.decision === "accept";

export const ComposerPendingApprovalActions = memo(function ComposerPendingApprovalActions({
  requestId,
  isResponding,
  options = DEFAULT_APPROVAL_OPTIONS,
  onRespondToApproval,
}: ComposerPendingApprovalActionsProps) {
  const primaryOptions = options.filter(isPrimaryDecision);
  const moreOptions = options.filter((option) => !isPrimaryDecision(option));

  return (
    <>
      {primaryOptions.map((option) => {
        const hint = approvalOptionHint(option);
        const button = (
          <Button
            key={option.decision}
            size="xs"
            variant={option.decision === "accept" ? "default" : "outline"}
            disabled={isResponding}
            aria-description={hint}
            onClick={() => void onRespondToApproval(requestId, option.decision)}
          >
            {option.warning ? <TriangleAlertIcon className="size-3 shrink-0" /> : null}
            <span className="max-w-40 truncate">{approvalOptionLabel(option)}</span>
          </Button>
        );
        return hint ? (
          <Tooltip key={option.decision}>
            <TooltipTrigger render={button} />
            <TooltipPopup side="top">{hint}</TooltipPopup>
          </Tooltip>
        ) : (
          button
        );
      })}
      {moreOptions.length > 0 ? (
        <Menu>
          <MenuTrigger
            disabled={isResponding}
            render={
              <Button size="icon-xs" variant="outline" aria-label={t("More approval options")} />
            }
          >
            <EllipsisIcon />
          </MenuTrigger>
          <MenuPopup {...composerFloatingLayerProps} side="top" align="end">
            {moreOptions.map((option) => {
              const item = (
                <MenuItem
                  key={option.decision}
                  disabled={isResponding}
                  aria-description={option.warning}
                  onClick={() => void onRespondToApproval(requestId, option.decision)}
                  variant="ghost"
                  className="mb-1 last:mb-0"
                >
                  {option.warning ? <TriangleAlertIcon className="size-3 text-warning" /> : null}
                  <span className="min-w-0 whitespace-normal wrap-break-word">
                    {approvalOptionLabel(option)}
                  </span>
                </MenuItem>
              );
              return option.warning ? (
                <Tooltip key={option.decision}>
                  <TooltipTrigger render={item} />
                  <TooltipPopup side="top">{option.warning}</TooltipPopup>
                </Tooltip>
              ) : (
                item
              );
            })}
          </MenuPopup>
        </Menu>
      ) : null}
    </>
  );
});
