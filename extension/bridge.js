export const COMPANION_ID='thunderstream-ui@local.invalid';
const COMMANDS=new Set(['next','previous','archive','star','unread','trash','compose','reply','reply-all','forward','tags']);
export function validateBridgeRequest(message,sender){return sender?.id===COMPANION_ID&&message?.type==='command'&&COMMANDS.has(message.commandId)&&Number.isInteger(message.windowId)&&Object.keys(message).every(k=>['type','commandId','windowId'].includes(k));}
