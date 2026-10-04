// The helper owns Google credentials. Neither tokens nor arbitrary URLs cross this boundary.
export function createNativeClient(api){
 let port=null,sequence=0;const pending=new Map();
 function fail(connection){if(port!==connection)return;port=null;for(const item of pending.values()){clearTimeout(item.timer);item.reject(Object.assign(new Error('helper-unavailable'),{code:'helper-unavailable'}));}pending.clear();}
 return {request(op,args={}){
  return new Promise((resolve,reject)=>{
   let connection=port;
   try{
    if(!port){
     port=api.runtime.connectNative('eu.thunderstream.gmail_search');
     connection=port;
     port.onMessage.addListener(reply=>{
      if(port!==connection)return;
      const item=pending.get(reply?.id);if(!item)return;
      pending.delete(reply.id);clearTimeout(item.timer);
      if(reply.ok)item.resolve(reply);else item.reject(Object.assign(new Error('gmail-request-failed'),{code:reply.code||'helper-failed'}));
     });
     port.onDisconnect.addListener(()=>fail(connection));
    }
    const id=++sequence;
    const timer=setTimeout(()=>{if(port!==connection)return;fail(connection);try{connection.disconnect();}catch{}},240000);
    pending.set(id,{resolve,reject,timer});port.postMessage({...args,id,op});
   }catch{fail(connection);reject(Object.assign(new Error('helper-unavailable'),{code:'helper-unavailable'}));}
  });
 }};
}
