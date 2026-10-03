export function setText(node,value){node.textContent=String(value);}
export function element(tag,text,attributes={}){const node=document.createElement(tag);if(text!==undefined)setText(node,text);for(const [key,value] of Object.entries(attributes))node.setAttribute(key,value);return node;}
