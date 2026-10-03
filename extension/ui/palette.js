import {handlePaletteKey,nextAvailable} from './keys.js';
import {filterCommands} from '../commands.js';
import {mutationText} from '../outcomes.js';
import {element,setText} from './dom.js';
const query=document.querySelector('#query'),list=document.querySelector('#commands'),status=document.querySelector('#status');
let token,commands=[],filtered=[],index=-1,busy=false;
function render(){
 filtered=filterCommands(commands,query.value);
 if(!filtered[index]?.available)index=nextAvailable(filtered,-1,1);
 list.replaceChildren();query.removeAttribute('aria-activedescendant');list.setAttribute('aria-busy',String(busy));
 filtered.forEach((c,i)=>{
  const option=element('div',c.title,{id:'command-'+i,role:'option','aria-selected':String(i===index),'aria-disabled':String(!c.available||busy),'data-command':c.id});
  option.className=i===index?'command selected':'command';
  option.addEventListener('click',()=>execute(c));list.append(option);
  if(i===index)query.setAttribute('aria-activedescendant',option.id);
 });
 if(!filtered.length)setText(status,'No matching actions');
}
async function execute(command){
 if(busy||!command?.available)return;busy=true;render();
 let result;try{result=await messenger.runtime.sendMessage({type:'command:run',token,commandId:command.id});}catch{result={ok:false,code:'result-unavailable'};}
 busy=false;
 if(result.ok&&result.code==='show-tags')location.href='tags.html?token='+encodeURIComponent(token);
 else if(result.ok&&result.code==='show-identities')location.href='identities.html?token='+encodeURIComponent(token);
 else if(result.ok)window.close();
 else{
  if(result.outcomes){setText(status,mutationText(result));commands=commands.map(c=>({...c,available:false}));}
  else setText(status,result.code==='selection-changed'?'Selection changed. Reopen the palette.':'Action unavailable: '+result.code);
  render();
 }
}
query.addEventListener('input',()=>{index=-1;render();});
document.addEventListener('keydown',event=>handlePaletteKey(event,{close:()=>window.close(),enterEnabled:event.target===query,execute:()=>execute(filtered[index]),navigate:delta=>{index=nextAvailable(filtered,index,delta);render();list.children[index]?.scrollIntoView({block:'nearest'});}}));
try{const data=await messenger.runtime.sendMessage({type:'palette:init'});if(!data.ok)throw Error();token=data.token;commands=data.commands;render();query.focus();}catch{setText(status,'Thunderstream is unavailable. Native Thunderbird remains usable.');}
