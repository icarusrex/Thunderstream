import {validateSelection} from './selection.js';
// Choosing this entry passes no identity, so Thunderbird applies its own account/alias rules (TS-602).
export const NATIVE_IDENTITY='thunderbird-default';
export async function listSendingIdentities(api,context){
 const accounts=await api.accounts.list(false);
 const explicit=accounts.flatMap(account=>(account.identities||[]).map(identity=>({id:identity.id,email:identity.email,accountName:account.name}))).sort((a,b)=>a.email.localeCompare(b.email));
 return [{id:NATIVE_IDENTITY,email:'Thunderbird default',accountName:'account and alias rules',native:true},...explicit];
}
export async function beginWithIdentity(api,action,context,identityId){
 try{
 const identities=await listSendingIdentities(api,context);if(!identities.some(i=>i.id===identityId))return {ok:false,code:'identity-unavailable'};
 const details=identityId===NATIVE_IDENTITY?undefined:{identityId};
 if(action==='compose')await (details?api.compose.beginNew(details):api.compose.beginNew());
 else{const ids=await validateSelection(api,context.selection);if(ids.length!==1)return {ok:false,code:'select-one-message'};
 // No forward type: Thunderbird's inline/attachment preference applies.
 if(action==='forward')await (details?api.compose.beginForward(ids[0],undefined,details):api.compose.beginForward(ids[0]));
 else if(action==='reply'||action==='reply-all'){const type=action==='reply'?'replyToSender':'replyToAll';await (details?api.compose.beginReply(ids[0],type,details):api.compose.beginReply(ids[0],type));}
 else return {ok:false,code:'unsupported-command'};
 }
 return {ok:true,code:'opened'};
 }catch{return {ok:false,code:'compose-open-failed'};}
}
