const fs=require('node:fs');
(async()=>{
 const targets=await (await fetch('http://127.0.0.1:9222/json')).json();
 const ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
 await new Promise(r=>ws.addEventListener('open',r,{once:true}));
 let serial=0;const pending=new Map();
 ws.addEventListener('message',event=>{const data=JSON.parse(event.data);if(data.id){const p=pending.get(data.id);pending.delete(data.id);data.error?p.reject(data.error):p.resolve(data.result);}});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await send('Page.enable');await send('Runtime.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await send('Page.navigate',{url:'file:///D:/National%20University/johannescls-pr/nu-lipa.html'});
 await new Promise(r=>setTimeout(r,1200));
 async function snap(id,name){
   await evaluate(`document.getElementById('${id}').scrollIntoView({behavior:'instant'}); window.scrollBy({top:-70,behavior:'instant'});`);
   await evaluate(`Promise.all([...document.querySelectorAll('#${id} img')].map(img=>{img.loading='eager';return img.decode().catch(()=>{});})).then(()=>true)`);
   await new Promise(r=>setTimeout(r,150));
   const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync('tmp/'+name,Buffer.from(shot.data,'base64'));
 }

 for (const id of ['nu-uaap','nu-printed','nu-campaigns']) await snap(id,id+'-desktop.png');
 console.log('Matchday controls:',await evaluate(`(()=>{const g=document.querySelector('[data-nu-matchday]');const buttons=[...g.querySelectorAll('[data-match-select]')];buttons[2].click();buttons[0].focus();buttons[0].dispatchEvent(new KeyboardEvent('keydown',{key:'End',bubbles:true}));return {visible:[...g.querySelectorAll('[data-match-panel]')].filter(p=>!p.hidden).length,finalsSelected:buttons[2].getAttribute('aria-pressed'),keyboardFocus:document.activeElement===buttons[2]};})()`));
 console.log('Print view:',await evaluate(`(()=>{const g=document.querySelector('[data-nu-print-gallery]');g.querySelector('[data-print-toggle]').click();return g.classList.contains('is-artwork-view');})()`));
 console.log('Lightbox:',await evaluate(`(()=>{document.querySelector('[data-match-panel]:not([hidden]) button').click();const opened=document.querySelector('#lightbox').open;document.querySelector('#lightbox').close();return opened;})()`));
 for(const width of [390,820,1920]) {
   await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width===390});
   console.log('Overflow at '+width+':',await evaluate(`document.documentElement.scrollWidth>innerWidth`));
   if(width===390) for(const id of ['nu-uaap','nu-printed','nu-campaigns']) await snap(id,id+'-mobile.png');
 }
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 await new Promise(r=>setTimeout(r,100));
 console.log('Motion enabled:',await evaluate(`document.documentElement.dataset.motion`));
 await evaluate(`document.querySelector('[data-match-select]').click();document.querySelector('.motion-toggle').click()`);
 console.log('Toggle cancels transition:',await evaluate(`document.documentElement.dataset.motion==='off'&&[...document.querySelectorAll('[data-match-panel]')].every(p=>p.getAnimations().length===0)`));
 console.log('Cover regression:',await evaluate(`(()=>{document.querySelector('[data-cover-next]').click();return [...document.querySelectorAll('[data-cover-panel]')].filter(p=>!p.hidden).length===1;})()`));
 console.log('Broken new images:',await evaluate(`[...document.querySelectorAll('#nu-uaap img,#nu-printed img,#nu-campaigns img')].filter(i=>i.complete&&!i.naturalWidth).length`));
 await send('Browser.close');ws.close();
})().catch(e=>{console.error(e);process.exit(1);});
