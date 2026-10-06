export function mutationResult(outcomes){
 const completed=outcomes.filter(o=>o.state==='completed').length;
 const uncertain=outcomes.filter(o=>o.state==='uncertain').length;
 const failed=outcomes.filter(o=>o.state==='failed').length;
 return {ok:completed===outcomes.length,code:completed===outcomes.length?'done':completed?'partial':'action-uncertain',completed,uncertain,failed,total:outcomes.length,outcomes};
}
const CODE_TEXT={'group-unavailable':'That account group is unavailable. Choose All accounts or edit the group.','group-changed':'Account group membership changed. Reopen the palette.','invalid-group':'Use a unique name up to 80 characters and select at least one current account. All accounts is reserved; at most 20 groups can be saved.','context-busy':'Wait for the account group to finish changing.','no-selection':'Select a message first. In a message tab or window, the displayed message is used.','selection-changed':'Selection changed. Reopen the palette.','select-one-message':'Select exactly one message.','already-in-trash':'Already in Trash. Thunderstream never deletes permanently.','trash-folder-unavailable':'This account has no single Trash folder; nothing was moved.','unsupported-command':'This action is unavailable in this Thunderbird version or context.','action-failed':'Thunderbird rejected the action. Nothing was retried.','context-expired':'This palette expired. Reopen it.','not-a-mail-tab':'Open a mail folder tab first.','search-unsupported':'Nothing to search for.','folder-unavailable':'That folder is no longer available.','layout-unavailable':'Layout changes are unavailable in this preview.','result-unavailable':'No result was returned. Check the mailbox before retrying.','tag-unavailable':'That tag no longer exists.','invalid-tags':'The tag change was invalid; nothing was changed.','identity-unavailable':'That sender is no longer configured.','compose-open-failed':'Thunderbird could not open compose.'};
export function codeText(code){return CODE_TEXT[code]||'Action unavailable ('+(code||'unknown')+').';}
export function mutationText(result,verb='Changed'){
 if(!result.outcomes)return result.code||'Action unavailable';
 return `${verb} ${result.completed} of ${result.total}; ${result.uncertain} uncertain, ${result.failed} failed. ${result.ok?'':'Check the mailbox before taking further action; no automatic retry.'}`.trim();
}
