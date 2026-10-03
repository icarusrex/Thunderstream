import {setText} from './dom.js';
import {sendResultText} from '../send-results.js';
const button=document.querySelector('#send'),status=document.querySelector('#status');let token;
try{
 const data=await messenger.runtime.sendMessage({type:'compose:init'});token=data.token;
 setText(document.querySelector('#sender'),'From: '+(data.sender||'Check the native From field'));
 button.disabled=!data.available;
 if(data.scope)setText(document.querySelector('#scope'),`Sends this reply immediately, then archives ${data.scope.count} message${data.scope.count===1?'':'s'} from this conversation in the original’s folder (the replied-to message and earlier messages it references; newer replies are left alone).${data.scope.complete?'':' Some earlier messages could not be checked and will stay.'} Queued mail is never archived.`);
 if(data.locked)setText(status,sendResultText({code:'already-running'}));
 else if(!data.available)setText(status,'Enable Send & Archive and grant send permission in Thunderstream settings.');
}catch{setText(status,'Compose action unavailable.');}
button.addEventListener('click',async()=>{
 button.disabled=true;
 try{const r=await messenger.runtime.sendMessage({type:'compose:send-archive',token});setText(status,sendResultText(r));}
 catch{setText(status,'Result unavailable. Check Sent and Outbox. Thunderstream will not retry.');}
});
