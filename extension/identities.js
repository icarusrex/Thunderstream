import {validateSelection} from './selection.js';
import {currentAccountId} from './navigation.js';
// compose.beginReply without an identity uses the default identity, not Thunderbird's reply rules (verified on 157.0.1:
// a message addressed to an alias opened From the primary address). So the suggestion is computed here, shown as a
// concrete address, and passed explicitly. Rule mirrored from native Reply: an identity whose address is among the
// message recipients (the message's own account first), otherwise that account's default identity.
const address=value=>(String(value).match(/<([^>]+)>/)?.[1]??String(value)).trim().toLowerCase();
async function suggest(api,accounts,context){
 if(context.composeAction==='compose'){
  const accountId=await currentAccountId(api,context.tabId);const home=accounts.find(a=>a.id===accountId);
  return home?.identities?.[0]?{id:home.identities[0].id,reason:'default for '+home.name}:null;
 }
 const ids=await validateSelection(api,context.selection);if(ids.length!==1)return null;
 const header=await api.messages.get(ids[0]);const accountId=header.folder?.accountId;
 const recipients=new Set([...(header.recipients||[]),...(header.ccList||[]),...(header.bccList||[])].map(address));
 const ordered=[...accounts.filter(a=>a.id===accountId),...accounts.filter(a=>a.id!==accountId)];
 for(const account of ordered)for(const identity of account.identities||[])if(recipients.has(identity.email.toLowerCase()))return {id:identity.id,reason:'matches a recipient'};
 const home=accounts.find(a=>a.id===accountId);
 return home?.identities?.[0]?{id:home.identities[0].id,reason:'default for '+home.name}:null;
}
export async function listSendingIdentities(api,context={}){
 const accounts=await api.accounts.list(false);
 const all=accounts.flatMap(account=>(account.identities||[]).map(identity=>({id:identity.id,email:identity.email,accountName:account.name}))).sort((a,b)=>a.email.localeCompare(b.email));
 let suggestion=null;try{suggestion=await suggest(api,accounts,context);}catch{}
 const suggested=suggestion&&all.find(i=>i.id===suggestion.id);
 if(!suggested)return all;
 return [{...suggested,suggested:true,reason:suggestion.reason},...all.filter(i=>i!==suggested)];
}
export async function beginWithIdentity(api,action,context,identityId){
 try{
 const identities=await listSendingIdentities(api,{...context,composeAction:action});if(!identities.some(i=>i.id===identityId))return {ok:false,code:'identity-unavailable'};
 const details={identityId};
 if(action==='compose')await api.compose.beginNew(details);
 else{const ids=await validateSelection(api,context.selection);if(ids.length!==1)return {ok:false,code:'select-one-message'};
 // No forward type: Thunderbird's inline/attachment preference applies.
 if(action==='forward')await api.compose.beginForward(ids[0],undefined,details);
 else if(action==='reply'||action==='reply-all')await api.compose.beginReply(ids[0],action==='reply'?'replyToSender':'replyToAll',details);
 else return {ok:false,code:'unsupported-command'};
 }
 return {ok:true,code:'opened'};
 }catch{return {ok:false,code:'compose-open-failed'};}
}
