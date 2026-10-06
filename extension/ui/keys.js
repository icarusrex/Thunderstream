function composing(event){return event.isComposing||event.keyCode===229;}
export function handlePaletteKey(event,actions){
 if(composing(event))return;
 if(event.key==='Escape'){actions.close();return;}
 if(actions.navigateEnabled!==false&&(event.key==='ArrowDown'||event.key==='ArrowUp')){event.preventDefault();actions.navigate(event.key==='ArrowDown'?1:-1);}
 if(event.key==='Enter'&&actions.enterEnabled!==false){event.preventDefault();actions.execute();}
}
export function handleTagKey(event,actions){
 if(composing(event))return;
 if(event.key==='Escape'){actions.close();return;}
 if(event.key==='Enter'&&actions.enterEnabled!==false&&event.target?.tagName!=='BUTTON'){event.preventDefault();actions.apply();}
}
export function nextAvailable(commands,index,delta){
 const start=index<0?(delta>0?0:commands.length-1):index+delta;
 for(let i=start;i>=0&&i<commands.length;i+=delta)if(commands[i].available)return i;
 return commands[index]?.available?index:-1;
}
