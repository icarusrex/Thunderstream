import {element,setText} from './dom.js';
import {codeText} from '../outcomes.js';
const list=document.querySelector('#messages'),scope=document.querySelector('#scope'),issues=document.querySelector('#issues'),status=document.querySelector('#status'),refresh=document.querySelector('#refresh'),empty=document.querySelector('#empty');
const token=new URL(location.href).searchParams.get('token');
let busy=false,loaded=false,expired=!token,buttons=[];
const explanation=code=>code==='context-expired'?'This reference view expired. Reopen it from Quick Open.':codeText(code);
function controls(){refresh.disabled=busy||expired;list.setAttribute('aria-busy',String(busy));for(const button of buttons)button.disabled=busy||!loaded||expired;}
function render(data){
 scope.textContent=data.scope.accountName+' · '+data.scope.folderName;
 issues.replaceChildren();const counts=data.issues||{};
 if(counts.headersUnavailable)issues.append(element('li','References in the selected message could not be read. Refresh this list to retry.'));
 for(const [key,message] of [['missing','not found in this folder.'],['ambiguous','with multiple matches; left out.'],['unavailable','could not be checked.'],['truncated','left out by the 50-reference limit.']])if(counts[key])issues.append(element('li',`${counts[key]} reference${counts[key]===1?'':'s'} ${message}`));
 empty.hidden=data.items.some(item=>!item.selected);list.replaceChildren();buttons=[];
 for(const item of data.items){
  const row=element('article');row.className='message'+(item.selected?' selected-message':'');
  const kind=element('p',item.selected?'Selected message':'Referenced message');kind.className='message-kind';
  const title=element('h2',item.subject),author=element('p',item.author);
  const date=new Date(item.date),when=element('time',item.date&&Number.isFinite(date.getTime())?date.toLocaleString():'Date unavailable');when.className='hint';if(item.date&&Number.isFinite(date.getTime()))when.setAttribute('datetime',item.date);
  const button=element('button','Open in Thunderbird',{'aria-label':`Open ${item.selected?'selected':'referenced'} message: ${item.subject}`});button.addEventListener('click',()=>open(item.id));
  row.append(kind,title,author,when,button);list.append(row);buttons.push(button);
 }
}
async function open(messageId){
 if(busy||!loaded||expired)return;busy=true;controls();setText(status,'Opening in Thunderbird…');
 try{const result=await messenger.runtime.sendMessage({type:'references:open',token,messageId});
  setText(status,result.ok?'Opened in Thunderbird.':explanation(result.code));
  if(['references-stale','context-expired'].includes(result.code)){loaded=false;expired=result.code==='context-expired';}
 }catch{setText(status,'Thunderbird could not return an opening result. Check its tabs before retrying.');}
 finally{busy=false;controls();}
}
async function load(){
 if(busy||expired)return;busy=true;loaded=false;controls();setText(status,'Checking message references…');
 try{const data=await messenger.runtime.sendMessage({type:'references:init',token});if(!data.ok){setText(status,explanation(data.code));expired=data.code==='context-expired';return;}render(data);loaded=true;setText(status,'');}
 catch{setText(status,'References could not be checked. Refresh the list to retry.');}
 finally{busy=false;controls();}
}
refresh.addEventListener('click',load);
if(token)await load();else{setText(status,explanation('context-expired'));controls();}
