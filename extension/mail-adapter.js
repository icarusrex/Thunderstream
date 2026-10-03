export async function collectMessages(api,page){
 const result=[];
 while(page){result.push(...page.messages);if(!page.id)break;page=await api.messages.continueList(page.id);}
 return result;
}
// messages.listTags is deprecated since Thunderbird 121 and logs an error on every call; keep it only as a fallback.
export async function listTags(api){return typeof api.messages.tags?.list==='function'?api.messages.tags.list():api.messages.listTags();}
export async function trashDestinations(api,headers){
 const destinations=new Map();
 for(const header of headers){const accountId=header.folder?.accountId;if(!accountId)throw Error('missing-account');if(destinations.has(accountId))continue;
 const folders=await api.folders.query({accountId,specialUse:['trash']});if(folders.length!==1)throw Error('trash-folder-unavailable');destinations.set(accountId,folders[0].id);}
 return destinations;
}
