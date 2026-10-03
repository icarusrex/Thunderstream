export function mutationResult(outcomes){
 const completed=outcomes.filter(o=>o.state==='completed').length;
 const uncertain=outcomes.filter(o=>o.state==='uncertain').length;
 const failed=outcomes.filter(o=>o.state==='failed').length;
 return {ok:completed===outcomes.length,code:completed===outcomes.length?'done':completed?'partial':'action-uncertain',completed,uncertain,failed,total:outcomes.length,outcomes};
}
export function mutationText(result,verb='Changed'){
 if(!result.outcomes)return result.code||'Action unavailable';
 return `${verb} ${result.completed} of ${result.total}; ${result.uncertain} uncertain, ${result.failed} failed. ${result.ok?'':'Check the mailbox before taking further action; no automatic retry.'}`.trim();
}
