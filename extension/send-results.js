const resultWrites=new WeakMap();
export function publishSendResult(api,result,context={}){
 if(result.code==='already-running')return Promise.resolve();
 const storage=api.storage.local;
 const pending=(resultWrites.get(storage)||Promise.resolve()).then(()=>writeSendResult(api,result,context));
 resultWrites.set(storage,pending.catch(()=>{}));
 return pending;
}
async function writeSendResult(api,result,context){
 const id=context.id||crypto.randomUUID();
 const record={ok:result.ok,code:result.code,at:Date.now(),id,tabId:context.tabId,...(Number.isInteger(result.archived)?{archived:result.archived}:{})};
 const stored=(await api.storage.local.get('sendResults')).sendResults||{};
 stored[id]=record;
 const sendResults=Object.fromEntries(Object.entries(stored).sort((a,b)=>b[1].at-a[1].at).slice(0,20));
 await api.storage.local.set({lastSendResult:record,sendResults});
 if(!result.ok){try{await api.tabs.create({url:api.runtime.getURL('ui/send-result.html')+'?id='+encodeURIComponent(id)});}catch{}}
}
export function sendResultText(result){
 if(result?.code==='offline')return 'Thunderbird is offline. Go online and try Send & Archive again, or use Thunderbird\u2019s Send Later. Nothing was sent or archived.';
 const messages={'sent-archive-failed':'Sent; the replied-to message could not be archived. Do not resend.','not-confirmed-sent':'Sending was not confirmed. Check Sent and Outbox before taking any further action. The original message was not archived.','send-failed':'Thunderbird reported that sending did not complete (cancelled, rejected or failed). Delivery is unlikely but not guaranteed. Check Sent and Outbox; Thunderstream will not retry.','already-running':'Send & Archive was already attempted from this compose window. Use Thunderbird\u2019s own Send if you still need to send; Thunderstream will not send or archive twice.','sent-and-archived':'Sent and archived.','compose-check-failed':'Compose could not be checked. No send was attempted.','not-a-reply':'This action requires a reply with a known original message.'};
 if(result?.code==='sent-and-archived'&&Number.isInteger(result.archived))return `Sent and archived ${result.archived} message${result.archived===1?'':'s'} from this conversation.`;
 return messages[result?.code]||'No result is available.';
}
