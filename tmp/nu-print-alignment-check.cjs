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




 await evaluate(`Promise.all([...document.querySelectorAll('#nu-campaigns img,#nu-printed img')].map(i=>{i.loading='eager';return i.decode()}))`);
 console.log('Print materials:',await evaluate(`document.querySelectorAll('#nu-printed .nu-print-object').length`));
 console.log('Campaign alignment:',await evaluate(`(()=>{const cards=[...document.querySelectorAll('.nu-campaign-card')];const rects=cards.map(c=>c.getBoundingClientRect());const imgs=cards.map(c=>c.querySelector('img').getBoundingClientRect());const same=(items,key)=>Math.max(...items.map(r=>r[key]))-Math.min(...items.map(r=>r[key]))<1;return {tops:same(rects,'top'),bottoms:same(rects,'bottom'),imageTops:same(imgs,'top'),imageHeights:same(imgs,'height')};})()`));
 await evaluate(`document.querySelector('.nu-campaign-grid').scrollIntoView({behavior:'instant'});window.scrollBy({top:-95,behavior:'instant'})`);
 let shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync('tmp/nu-campaigns-aligned.png',Buffer.from(shot.data,'base64'));
 await evaluate(`document.querySelector('.nu-installation').scrollIntoView({behavior:'instant'});window.scrollBy({top:-95,behavior:'instant'})`);
 shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync('tmp/nu-four-prints.png',Buffer.from(shot.data,'base64'));
 console.log('New print lightbox:',await evaluate(`(()=>{document.querySelectorAll('.nu-print-object--banner button')[1].click();return document.querySelector('#lightbox').open;})()`));
 await evaluate(`document.querySelector('#lightbox').close();document.querySelector('[data-print-toggle]').click()`);
 console.log('Artwork toggle:',await evaluate(`document.querySelector('[data-nu-print-gallery]').classList.contains('is-artwork-view')`));
 for(const width of [390,820,1920]){await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width===390});console.log('Overflow '+width+':',await evaluate(`document.documentElement.scrollWidth>innerWidth`));}
 console.log('Headline:',await evaluate(`document.querySelector('#nu-flyers-title').textContent`));
 await send('Browser.close');ws.close();
})().catch(e=>{console.error(e);process.exit(1);});
