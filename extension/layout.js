const RECOMMENDED={layout:'vertical',folderPaneVisible:true,messagePaneVisible:true};
const SESSION_ID=crypto.randomUUID();
export async function applyLayout(api,storage,tabId){
 const tab=await api.mailTabs.get(tabId);
 const record=(await storage.get('layoutRestore')).layoutRestore||{global:{original:tab.layout,applied:'vertical'},tabs:{}};
 if(record.tabs[tabId]?.session!==SESSION_ID)record.tabs[tabId]={session:SESSION_ID,original:{folderPaneVisible:tab.folderPaneVisible,messagePaneVisible:tab.messagePaneVisible}};
 await storage.set({layoutRestore:record});
 await api.mailTabs.update(tabId,RECOMMENDED);
}
export async function restoreLayout(api,storage){
 const record=(await storage.get('layoutRestore')).layoutRestore;if(!record)return {ok:true,code:'nothing-to-restore'};
 try{
 const tabs=await api.mailTabs.query({});const available=tabs.find(t=>t.active)||tabs[0];
 if(!available)return {ok:false,code:'Open a mailbox to restore layout'};
 if(!record.global.restored&&available.layout===record.global.applied)await api.mailTabs.update(available.id,{layout:record.global.original});
 record.global.restored=true;
 for(const [id,baseline] of Object.entries(record.tabs)){
  if(baseline.session!==SESSION_ID)continue;
  let tab;try{tab=await api.mailTabs.get(Number(id));}catch{delete record.tabs[id];continue;}
  const changes={};for(const [key,original] of Object.entries(baseline.original)){if(tab[key]===RECOMMENDED[key]&&original!==undefined)changes[key]=original;}
  if(Object.keys(changes).length)await api.mailTabs.update(Number(id),changes);
  delete record.tabs[id];
 }
 const unresolvedTabs=Object.keys(record.tabs).length;
 if(unresolvedTabs){await storage.set({layoutRestore:record});return {ok:false,code:'layout-partial',unresolvedTabs};}
 await storage.remove('layoutRestore');return {ok:true,code:'restored'};
 }catch{return {ok:false,code:'layout-restore-failed'};}
}
