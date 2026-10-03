// Palette navigation built only on public folder and mail-tab APIs. Nothing here changes stored mail or Thunderbird settings.
const PLACES=[['inbox','Inbox'],['sent','Sent'],['drafts','Drafts'],['archives','Archive']];
async function first(api,query){try{return (await api.folders.query(query))[0];}catch{return undefined;}}
export async function currentAccountId(api,tabId){try{return (await api.mailTabs.get(tabId)).displayedFolder?.accountId;}catch{return undefined;}}
export async function listDestinations(api,currentAccount){
 const result=[];
 const unified=await first(api,{isUnified:true,specialUse:['inbox']});
 if(unified)result.push({id:'go:unified',title:'Go to Unified Inbox',keywords:'all accounts inbox unified',folderId:unified.id,rank:0});
 const accounts=await api.accounts.list(false);
 for(const [use,label] of PLACES)for(const account of accounts){
  const folder=await first(api,{accountId:account.id,specialUse:[use]});if(!folder)continue;
  const current=account.id===currentAccount;
  result.push({id:'go:'+folder.id,title:`Go to ${label} · ${account.name}${current?' (current)':''}`,keywords:`${label} ${account.name} account switch`,folderId:folder.id,rank:use==='inbox'?1:2});
 }
 return result;
}
export async function listTagDestinations(api,tags){
 let folders=[];try{folders=await api.folders.query({isTag:true});}catch{}
 return tags.map(tag=>{const folder=folders.find(f=>f.name===tag.tag);return {id:'tag:'+tag.key,title:'Go to tag · '+tag.tag,keywords:'label tag '+tag.tag,tagKey:tag.key,folderId:folder?.id};});
}
export async function openDestination(api,tabId,destination){
 try{await api.mailTabs.get(tabId);}catch{return {ok:false,code:'not-a-mail-tab'};}
 try{
  if(destination.folderId)await api.mailTabs.update(tabId,{displayedFolder:destination.folderId});
  else if(destination.tagKey)await api.mailTabs.setQuickFilter(tabId,{show:true,tags:{mode:'all',tags:{[destination.tagKey]:true}}});
  else if(destination.flagged)await api.mailTabs.setQuickFilter(tabId,{show:true,flagged:true});
  else return {ok:false,code:'folder-unavailable'};
  return {ok:true,code:'opened'};
 }catch{return {ok:false,code:'folder-unavailable'};}
}
