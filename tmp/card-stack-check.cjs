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



 console.log('Card stack:',await evaluate(`(()=>{const g=document.querySelector('[data-nu-matchday]');const front=()=>g.querySelector('.is-front [data-title]').dataset.title;const before=front();g.querySelector('[data-match-next]').click();return {before,after:front(),cards:g.querySelectorAll('[data-match-panel]').length,front:g.querySelectorAll('.is-front').length,rearInert:g.querySelector('[data-match-panel]:not(.is-front)').inert,iconOnly:g.querySelector('[data-match-next]').textContent.trim()==='',oldControls:g.querySelectorAll('[data-match-select]').length};})()`));
 async function capture(name){await evaluate(`document.querySelector('.nu-matchday').scrollIntoView({behavior:'instant'});window.scrollBy({top:-80,behavior:'instant'});Promise.all([...document.querySelectorAll('[data-match-panel] img')].map(i=>{i.loading='eager';return i.decode()}))`);const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync('tmp/'+name,Buffer.from(shot.data,'base64'));}
 await capture('nu-card-stack-desktop.png');
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});await new Promise(r=>setTimeout(r,100));
 console.log('Animated swap:',await evaluate(`(()=>{document.querySelector('[data-match-next]').click();return document.querySelectorAll('[data-match-panel]').length===2&&[...document.querySelectorAll('[data-match-panel]')].every(p=>p.getAnimations().length===1)})()`));
 await evaluate(`document.querySelector('.motion-toggle').click()`);
 console.log('Motion off cancels:',await evaluate(`[...document.querySelectorAll('[data-match-panel]')].every(p=>p.getAnimations().length===0)`));
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:1000,deviceScaleFactor:1,mobile:true});await capture('nu-card-stack-mobile.png');
 console.log('Mobile overflow:',await evaluate(`document.documentElement.scrollWidth>innerWidth`));
 await evaluate(`document.querySelector('.is-front [data-image]').click()`);console.log('Front card enlarges:',await evaluate(`document.querySelector('#lightbox').open`));
 await send('Browser.close');ws.close();
})().catch(e=>{console.error(e);process.exit(1);});
