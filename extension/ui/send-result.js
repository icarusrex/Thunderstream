import {setText} from './dom.js';
import {sendResultText} from '../send-results.js';
const id=new URL(location.href).searchParams.get('id');
const data=await messenger.storage.local.get(['sendResults','lastSendResult']);
const result=id?data.sendResults?.[id]:data.lastSendResult;
setText(document.querySelector('#result'),result?sendResultText(result)+' Compose tab '+result.tabId+' · '+new Date(result.at).toLocaleString(): 'This result has expired or is unavailable. Check Thunderbird before retrying.');
