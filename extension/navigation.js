// Palette navigation built only on public folder and mail-tab APIs. Nothing here changes stored mail or Thunderbird settings.
// Virtual folders (unified inbox, tag folders) are returned by folders.query even when their folder-pane mode is off, but
// a mail tab can only display them while that mode is enabled (verified on 157.0.1). Thunderstream never turns modes on.
const PLACES=[['inbox','Inbox'],['sent','Sent'],['drafts','Drafts'],['archives','Archive']];
async function first(api,query){try{return (await api.folders.query(query))[0];}catch{return undefined;}}
export async function mailTabInfo(api,tabId){if(!Number.isInteger(tabId))return null;try{return await api.mailTabs.get(tabId);}catch{return null;}}
export async function currentAccountId(api,tabId){return (await mailTabInfo(api,tabId))?.displayedFolder?.accountId;}
const modeOn=(tab,mode)=>Array.isArray(tab?.folderModesEnabled)&&tab.folderModesEnabled.includes(mode);
async function queryFolders(api,query){try{return await api.folders.query(query);}catch{return [];}}
const concreteFolder=folder=>folder?.id&&!folder.isRoot&&!folder.isTag&&!folder.isUnified;
const folderLabel=folder=>folder.path?.split('/').filter(Boolean).join(' / ')||folder.name;
export async function listDestinations(api,tab){
 const result=[],seen=new Set(),currentAccount=tab?.displayedFolder?.accountId;
 const unified=await first(api,{isUnified:true,specialUse:['inbox']});
 if(unified){
  const on=modeOn(tab,'unified');
  result.push({id:'go:unified',title:on?'Go to Unified Inbox':'Go to Unified Inbox (turn on Unified Folders in the folder pane)',keywords:'all accounts inbox unified',folderId:unified.id,rank:0,...(on?{}:{available:false})});
 }
 const accounts=await api.accounts.list(false);
 const [folders,favorites]=await Promise.all([
  queryFolders(api,{isRoot:false,isTag:false,isUnified:false}),
  queryFolders(api,{isFavorite:true,isRoot:false})
 ]);
 const favoriteIds=new Set(favorites.filter(concreteFolder).map(folder=>folder.id));
 const add=(folder,account,label,rank)=>{
  if(!concreteFolder(folder)||seen.has(folder.id))return;
  seen.add(folder.id);
  const favorite=favoriteIds.has(folder.id)||folder.isFavorite===true,current=account.id===currentAccount;
  result.push({id:'go:'+folder.id,title:`Go to ${favorite?'Favorite · ':''}${label} · ${account.name}${current?' (current)':''}`,
   keywords:`${label} ${folder.name||''} ${folder.path||''} ${account.name} folder account switch${favorite?' favorite favourite':''}`,
   folderId:folder.id,accountId:account.id,rank:favorite?1:rank});
 };
 // Keep special-use discovery independent so a failed broad query cannot remove Inbox/Sent navigation.
 for(const [use,label] of PLACES)for(const account of accounts){
  const folder=await first(api,{accountId:account.id,specialUse:[use]});if(folder)add(folder,account,label,use==='inbox'?1:2);
 }
 for(const account of accounts)for(const folder of [...folders,...favorites]){
  if(folder.accountId===account.id)add(folder,account,folderLabel(folder),3);
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
