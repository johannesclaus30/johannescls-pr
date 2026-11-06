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
 await snap('nu-flyers','nu-flyers-desktop.png');
 console.log(await evaluate(`(()=>{const d=document.querySelector('[data-nu-desk]');d.querySelector('[data-desk-toggle]').click();return {stacked:d.classList.contains('is-stacked'),pressed:d.querySelector('[data-desk-toggle]').getAttribute('aria-pressed')};})()`));
 await snap('nu-covers','nu-covers-desktop.png');
 console.log(await evaluate(`(()=>{const a=document.querySelector('[data-nu-covers]');a.querySelector('[data-cover-prev]').click();const panels=[...a.querySelectorAll('[data-cover-panel]')];return {visible:panels.filter(p=>!p.hidden).length,selected:panels.findIndex(p=>!p.hidden),status:a.querySelector('[data-cover-status]').textContent,motion:document.documentElement.dataset.motion,animations:panels.flatMap(p=>p.getAnimations()).length};})()`));
 await evaluate(`document.querySelector('[data-cover-panel]:not([hidden]) button').click()`);
 console.log('Lightbox opens:',await evaluate(`document.querySelector('#lightbox').open`));
 await evaluate(`document.querySelector('#lightbox').close()`);
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await snap('nu-flyers','nu-flyers-mobile.png');
 await snap('nu-covers','nu-covers-mobile.png');
 console.log('Mobile overflow:',await evaluate(`document.documentElement.scrollWidth>innerWidth`));
 console.log('Image errors:',await evaluate(`[...document.querySelectorAll('.nu-edition img')].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)`));

 await send('Emulation.setDeviceMetricsOverride',{width:820,height:1000,deviceScaleFactor:1,mobile:false});
 console.log('Tablet overflow:',await evaluate(`document.documentElement.scrollWidth>innerWidth`));
 console.log('Keyboard End:',await evaluate(`(()=>{const buttons=[...document.querySelectorAll('[data-cover-select]')];buttons[0].focus();buttons[0].dispatchEvent(new KeyboardEvent('keydown',{key:'End',bubbles:true}));return document.activeElement===buttons[2]&&buttons[2].getAttribute('aria-pressed')==='true';})()`));
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
 await new Promise(r=>setTimeout(r,100));
 console.log('Motion enabled:',await evaluate(`document.documentElement.dataset.motion`));
 await evaluate(`document.querySelector('[data-cover-next]').click();document.querySelector('.motion-toggle').click()`);
 console.log('Toggle stops cover motion:',await evaluate(`document.documentElement.dataset.motion==='off'&&[...document.querySelectorAll('[data-cover-panel]')].every(p=>p.getAnimations().length===0)`));
 await send('Browser.close');
 ws.close();
})().catch(e=>{console.error(e);process.exit(1);});
