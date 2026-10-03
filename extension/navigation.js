// Palette navigation built only on public folder and mail-tab APIs. Nothing here changes stored mail or Thunderbird settings.
// Virtual folders (unified inbox, tag folders) are returned by folders.query even when their folder-pane mode is off, but
// a mail tab can only display them while that mode is enabled (verified on 157.0.1). Thunderstream never turns modes on.
const PLACES=[['inbox','Inbox'],['sent','Sent'],['drafts','Drafts'],['archives','Archive']];
async function first(api,query){try{return (await api.folders.query(query))[0];}catch{return undefined;}}
export async function mailTabInfo(api,tabId){if(!Number.isInteger(tabId))return null;try{return await api.mailTabs.get(tabId);}catch{return null;}}
export async function currentAccountId(api,tabId){return (await mailTabInfo(api,tabId))?.displayedFolder?.accountId;}
const modeOn=(tab,mode)=>Array.isArray(tab?.folderModesEnabled)&&tab.folderModesEnabled.includes(mode);
export async function listDestinations(api,tab){
 const result=[],currentAccount=tab?.displayedFolder?.accountId;
 const unified=await first(api,{isUnified:true,specialUse:['inbox']});
 if(unified){
  const on=modeOn(tab,'unified');
  result.push({id:'go:unified',title:on?'Go to Unified Inbox':'Go to Unified Inbox (turn on Unified Folders in the folder pane)',keywords:'all accounts inbox unified',folderId:unified.id,rank:0,...(on?{}:{available:false})});
 }
 const accounts=await api.accounts.list(false);
 for(const [use,label] of PLACES)for(const account of accounts){
  const folder=await first(api,{accountId:account.id,specialUse:[use]});if(!folder)continue;
  const current=account.id===currentAccount;
  result.push({id:'go:'+folder.id,title:`Go to ${label} · ${account.name}${current?' (current)':''}`,keywords:`${label} ${account.name} account switch`,folderId:folder.id,rank:use==='inbox'?1:2});
 }
 return result;
}
export async function listTagDestinations(api,tags,tab){
 let folders=[];if(modeOn(tab,'tags')){try{folders=await api.folders.query({isTag:true});}catch{}}
 return tags.map(tag=>{const folder=folders.find(f=>f.name===tag.tag);return {id:'tag:'+tag.key,title:(folder?'Go to tag · ':'Filter this folder by tag · ')+tag.tag,keywords:'label tag go to '+tag.tag,tagKey:tag.key,folderId:folder?.id};});
}
const tagFilter=key=>({show:true,tags:{mode:'all',tags:{[key]:true}}});
export async function openDestination(api,tabId,destination){
 if(!await mailTabInfo(api,tabId))return {ok:false,code:'not-a-mail-tab'};
 try{
  if(destination.folderId){
   try{await api.mailTabs.update(tabId,{displayedFolder:destination.folderId});}
   catch(error){if(!destination.tagKey)throw error;await api.mailTabs.setQuickFilter(tabId,tagFilter(destination.tagKey));}
  }
  else if(destination.tagKey)await api.mailTabs.setQuickFilter(tabId,tagFilter(destination.tagKey));
  else if(destination.flagged)await api.mailTabs.setQuickFilter(tabId,{show:true,flagged:true});
  else return {ok:false,code:'folder-unavailable'};
  return {ok:true,code:'opened'};
 }catch{return {ok:false,code:'folder-unavailable'};}
}
