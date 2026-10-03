import {validateBridgeRequest} from './bridge.js';
import {createSendAndArchive} from './send-and-archive.js';
import {publishSendResult} from './send-results.js';
import {detectCapabilities} from './capabilities.js';
import {captureSelection,validateSelection} from './selection.js';
import {createCommands,runCommand} from './commands.js';
import {applyTagDelta} from './tags.js';
import {listTags} from './mail-adapter.js';
import {listInboxDestinations} from './accounts.js';
import {listSendingIdentities,beginWithIdentity} from './identities.js';
import {loadSettings,saveSettings} from './settings.js';
import {restoreLayout} from './layout.js';

const api=messenger;
const store=api.storage.local;
const sessions=new Map();
const sendArchive=createSendAndArchive(api);
const SESSION_LIFETIME=300000;
api.tabs.onRemoved.addListener(tabId=>{
 sendArchive.forget(tabId);
 for(const [token,context] of sessions)if(context.tabId===tabId)sessions.delete(token);
});
async function openSettings(){await api.runtime.openOptionsPage();}
async function mailTab(){const tabs=await api.mailTabs.query({});return tabs.find(t=>t.active)||tabs[0];}
async function buildCommands(){
 const capabilities=await detectCapabilities(api);
 const commands=createCommands(api,{capabilities,openSettings});
 commands.splice(7,0,{
  id:'tags',title:'Apply Thunderbird tags…',keywords:'label tag',available:capabilities.tags.available,
  run:async context=>{await validateSelection(api,context.selection);return {ok:true,code:'show-tags'};}
 });
 if(capabilities.accounts.available){
  try{for(const destination of await listInboxDestinations(api))commands.push({
   id:'inbox:'+destination.folderId,title:'Inbox · '+destination.name,keywords:destination.name,available:true,
   run:async context=>{await api.mailTabs.update(context.tabId,{displayedFolder:destination.folderId});return {ok:true,code:'opened'};}
  });}catch{}
 }
 commands.push({id:'apply-layout',title:'Apply recommended layout',keywords:'vertical appearance',available:capabilities.layout.available,
  run:async()=>({ok:false,code:'layout-unavailable'})});
 commands.push({id:'restore-layout',title:'Restore previous layout',keywords:'reset appearance',available:capabilities.layout.available,
  run:()=>restoreLayout(api,store)});
 return commands;
}
export async function createSession(tab){
 let selection;
 try{selection=await captureSelection(api,tab.id);}catch{}
 const token=crypto.randomUUID();
 sessions.set(token,{tabId:tab.id,windowId:tab.windowId,selection,created:Date.now()});
 for(const [key,value] of sessions)if(Date.now()-value.created>SESSION_LIFETIME)sessions.delete(key);
 return token;
}
async function handleMessage(message,sender){
 if(sender.id!==api.runtime.id||!sender.url?.startsWith(api.runtime.getURL('ui/')))return {ok:false,code:'untrusted-sender'};
 if(message.type==='settings:get')return {ok:true,settings:await loadSettings(store),capabilities:await detectCapabilities(api),lastSendResult:(await store.get('lastSendResult')).lastSendResult,layoutRestore:(await store.get('layoutRestore')).layoutRestore};
 if(message.type==='settings:save'){await saveSettings(store,message.settings);return {ok:true};}
 if(message.type==='settings:reset'){
  const restored=await restoreLayout(api,store);
  await store.remove('settings');
  return {ok:true,code:restored.ok?'settings-reset':'settings-reset-layout-pending'};
 }
 if(message.type==='layout:restore')return restoreLayout(api,store);
 if(message.type==='layout:apply')return {ok:false,code:'layout-unavailable'};
 if(message.type==='compose:init'){
  const [tab]=await api.tabs.query({active:true,currentWindow:true});if(!tab)return {ok:false};
  const details=await api.compose.getComposeDetails(tab.id);const token=await createSession(tab);
  let sender='';
  for(const account of await api.accounts.list(false)){
   const identity=account.identities?.find(i=>i.id===details.identityId);if(identity)sender=identity.email;
  }
  const locked=sendArchive.isLocked(tab.id);
  return {ok:true,token,sender,locked,available:!locked&&(await loadSettings(store)).sendArchiveEnabled&&await api.permissions.contains({permissions:['compose.send']})&&details.type==='reply'&&Number.isInteger(details.relatedMessageId)};
 }
 if(message.type==='palette:init'){
  const [tab]=await api.tabs.query({active:true,currentWindow:true});if(!tab)return {ok:false,code:'no-tab'};
  const token=await createSession(tab);const commands=await buildCommands();
  return {ok:true,token,commands:commands.map(({id,title,keywords,available})=>({id,title,keywords,available}))};
 }
 const session=sessions.get(message.token);
 if(!session||Date.now()-session.created>SESSION_LIFETIME)return {ok:false,code:'context-expired'};
 if(message.type==='identities:init'){
  if(!session.composeAction)return {ok:false,code:'no-compose-action'};
  return {ok:true,identities:await listSendingIdentities(api,session)};
 }
 if(message.type==='identities:open'){
  const result=await beginWithIdentity(api,session.composeAction,session,message.identityId);
  if(result.ok)sessions.delete(message.token);return result;
 }
 if(message.type==='compose:send-archive'){
  if(!(await loadSettings(store)).sendArchiveEnabled)return {ok:false,code:'disabled'};
  if(!await api.permissions.contains({permissions:['compose.send']}))return {ok:false,code:'permission-required'};
  const result=await sendArchive.run(session.tabId);
  await publishSendResult(api,result,{id:message.token,tabId:session.tabId});
  return result;
 }
 if(message.type==='tags:init'){
  const ids=await validateSelection(api,session.selection);
  const headers=await Promise.all(ids.map(id=>api.messages.get(id)));
  const recent=(await loadSettings(store)).recentTagIds;
  const rank=tag=>recent.includes(tag.key)?recent.indexOf(tag.key):100;
  const tags=(await listTags(api)).map(tag=>({...tag,all:headers.every(h=>h.tags.includes(tag.key)),some:headers.some(h=>h.tags.includes(tag.key))})).sort((a,b)=>rank(a)-rank(b));
  return {ok:true,tags};
 }
 if(message.type==='tags:apply'){
  const result=await applyTagDelta(api,session.selection,message.delta);
  if(result.ok){
   const settings=await loadSettings(store);
   settings.recentTagIds=[...new Set([...message.delta.add,...message.delta.remove,...settings.recentTagIds])].slice(0,10);
   await saveSettings(store,settings);sessions.delete(message.token);
  }
  if(result.outcomes)sessions.delete(message.token);return result;
 }
 if(message.type==='command:run'){
  const result=await runCommand(await buildCommands(),message.commandId,session);
  if(result.code==='show-identities')session.composeAction=result.action;
  if(result.outcomes||(result.ok&&!['show-tags','show-identities'].includes(result.code)))sessions.delete(message.token);
  return result;
 }
 return {ok:false,code:'unsupported-request'};
}
api.runtime.onMessage.addListener((message,sender)=>handleMessage(message,sender).catch(()=>({ok:false,code:'action-failed'})));
api.runtime.onMessageExternal.addListener(async(message,sender)=>{
 if(!validateBridgeRequest(message,sender))return {ok:false,code:'untrusted-request'};
 return {ok:false,code:'native-profile-unavailable'};
});
