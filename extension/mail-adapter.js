export async function collectMessages(api,page){
 const result=[];
 while(page){result.push(...page.messages);if(!page.id)break;page=await api.messages.continueList(page.id);}
 return result;
}
export async function listTags(api){return api.messages.listTags();}
export async function trashDestinations(api,headers){
 const destinations=new Map();
 for(const header of headers){const accountId=header.folder?.accountId;if(!accountId)throw Error('missing-account');if(destinations.has(accountId))continue;
 const folders=await api.folders.query({accountId,specialUse:['trash']});if(folders.length!==1)throw Error('trash-folder-unavailable');destinations.set(accountId,folders[0].id);}
 return destinations;
}
