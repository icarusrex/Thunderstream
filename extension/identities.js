import {validateSelection} from './selection.js';
export async function listSendingIdentities(api,context){
 const accounts=await api.accounts.list(false);
 return accounts.flatMap(account=>(account.identities||[]).map(identity=>({id:identity.id,email:identity.email,accountName:account.name}))).sort((a,b)=>a.email.localeCompare(b.email));
}
export async function beginWithIdentity(api,action,context,identityId){
 try{
 const identities=await listSendingIdentities(api,context);if(!identities.some(i=>i.id===identityId))return {ok:false,code:'identity-unavailable'};
 const details={identityId};
 if(action==='compose')await api.compose.beginNew(details);
 else{const ids=await validateSelection(api,context.selection);if(ids.length!==1)return {ok:false,code:'select-one-message'};
 if(action==='forward')await api.compose.beginForward(ids[0],'forwardInline',details);
 else if(action==='reply'||action==='reply-all')await api.compose.beginReply(ids[0],action==='reply'?'replyToSender':'replyToAll',details);
 else return {ok:false,code:'unsupported-command'};
 }
 return {ok:true,code:'opened'};
 }catch{return {ok:false,code:'compose-open-failed'};}
}
