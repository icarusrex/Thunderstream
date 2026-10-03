export async function detectCapabilities(api){
 let version='unknown';try{version=(await api.runtime.getBrowserInfo()).version;}catch{}
 const requirements={compose:['compose.beginNew','accounts.list'],reply:['compose.beginReply','accounts.list'],forward:['compose.beginForward','accounts.list'],archive:['messages.archive'],star:['messages.update'],unread:['messages.update'],trash:['messages.move','folders.query'],tags:['messages.update','messages.listTags'],accounts:['accounts.list','folders.query','mailTabs.update'],layout:['mailTabs.get','mailTabs.query','mailTabs.update'],sendArchive:['compose.getComposeDetails','compose.sendMessage','messages.archive']};
 const detected={version,...Object.fromEntries(Object.entries(requirements).map(([key,paths])=>{const available=paths.every(path=>typeof path.split('.').reduce((v,k)=>v?.[k],api)==='function');return [key,{available,reason:available?'':'Required Thunderbird API is unavailable'}];}))};
 detected.layout={available:false,reason:'Persistent layout changes are gated until disable-time cleanup is verified'};
 return detected;
}
