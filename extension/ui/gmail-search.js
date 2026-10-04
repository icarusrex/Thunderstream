import {element,setText} from './dom.js';
const $=selector=>document.querySelector(selector);
const status=$('#status'),account=$('#account'),results=$('#results'),query=$('#gmail-query'),scope=$('#scope'),spam=$('#spam-trash');
let email='',session='',generation=0,busy=false;
const messages={
 'helper-permission-required':'Connect Google account to enable the optional search helper.',
 'helper-unavailable':'The Mac search helper is not available. Install the Thunderstream helper first.',
 'client-not-configured':'The helper needs a Google Desktop client configuration. Complete Google setup first.',
 'sign-in-required':'Google sign-in has expired or is unavailable. Connect the account again.',
 'network-unavailable':'Google could not be reached. Check your connection and try again.',
 'rate-limited':'Google has limited requests. Wait before searching again.',
 'access-denied':'Google denied access. Check Gmail API and Workspace access settings.',
 'consent-denied':'Google sign-in was cancelled. No account was connected.',
 'sign-in-timeout':'Google sign-in timed out. Try connecting again.',
 'account-changed':'The connected account changed. Reconnect before searching.',
 'message-too-large':'This message exceeds the preview’s 25 MB opening limit.',
 'stale-search':'This search is no longer current. Run your query again.',
 'already-opening':'Another message is opening. Wait for it to finish.',
 'read-expired':'The message opening expired. Try opening it again.'
};
async function send(message){try{return await messenger.runtime.sendMessage(message);}catch{return{ok:false,code:'gmail-unavailable'};}}
function failure(result){
 setText(status,messages[result.code]||'The request failed. Results may be incomplete; nothing was changed.');
 if(['sign-in-required','account-changed','access-denied'].includes(result.code))$('#connect').hidden=false;
}
function controls(){
 $('#search').disabled=!email||busy;query.disabled=!email;scope.disabled=!email;spam.disabled=!email;
 $('#connect').disabled=busy;$('#disconnect').disabled=busy;$('#cancel').hidden=!busy;$('#next').disabled=busy;
}
function clear(){generation++;session='';results.replaceChildren();$('#next').hidden=true;}
function connected(data){
 email=data.connected?data.email:'';
 setText(account,email?'Searching '+email:'Connect a Google account to search its server mail.');
 $('#connect').hidden=!!email;$('#disconnect').hidden=!email;
 scope.replaceChildren(element('option','All Mail',{value:''}));
 for(const label of data.labels||[])scope.append(element('option',label.name,{value:label.id}));
 controls();
}
function render(data){
 session=data.session;results.replaceChildren();
 for(const item of data.items){
  const row=element('button','',{type:'button',class:'gmail-result'});
  row.append(element('span',item.subject||'(No subject)',{class:'subject'}),element('span',item.from,{class:'sender'}),element('span',item.date,{class:'date'}));
  row.addEventListener('click',async()=>{
   if(busy)return;const turn=generation;busy=true;controls();setText(status,'Opening server message…');
   const result=await send({type:'gmail:open',session,messageId:item.id});
   if(turn!==generation)return;busy=false;controls();
   if(result.ok)setText(status,'Opened a server copy in Thunderbird.');else failure(result);
  });results.append(row);
 }
 $('#next').hidden=!data.nextPageToken;
 setText(status,data.items.length?`${data.items.length} messages on this page${data.nextPageToken?'; more available':''}.`:'No matching messages.');
}
async function search(next=false){
 if(busy)return;
 const previous=session;clear();const turn=generation;busy=true;controls();setText(status,'Searching Google…');
 const result=await send(next?{type:'gmail:next',session:previous}:{type:'gmail:search',query:query.value,email,labelId:scope.value,includeSpamTrash:spam.checked});
 if(turn!==generation)return;
 busy=false;controls();if(result.ok)render(result);else failure(result);
}
$('#search-form').addEventListener('submit',event=>{event.preventDefault();search();});
$('#next').addEventListener('click',()=>search(true));
$('#cancel').addEventListener('click',()=>{clear();busy=false;controls();setText(status,'Search cancelled.');send({type:'gmail:cancel'});});
function edited(){clear();send({type:'gmail:cancel'});busy=false;controls();setText(status,'Press Search to run this query.');}
query.addEventListener('input',edited);scope.addEventListener('change',edited);spam.addEventListener('change',edited);
$('#connect').addEventListener('click',async()=>{
 if(busy)return;
 const granted=await messenger.permissions.request({permissions:['nativeMessaging']});
 if(!granted){setText(status,'The search helper permission was not granted.');return;}
 clear();busy=true;controls();$('#cancel').hidden=true;setText(status,'Complete Google sign-in in your browser…');
 const result=await send({type:'gmail:connect'});busy=false;
 if(result.ok){connected(result);if(result.warning)failure({code:result.warning});else setText(status,'Connected with read-only Gmail access.');}else{controls();failure(result);}
});
$('#disconnect').addEventListener('click',async()=>{
 clear();busy=true;controls();$('#cancel').hidden=true;const result=await send({type:'gmail:disconnect'});busy=false;
 if(result.ok){connected({connected:false});setText(status,'Local credentials removed. Google account permissions can also be revoked in your Google Account settings.');}else{controls();failure(result);}
});
const initial=await send({type:'gmail:status'});
if(initial.ok){connected(initial);if(initial.warning)failure({code:initial.warning});}else failure(initial);
