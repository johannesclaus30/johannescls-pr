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



 await evaluate(`Promise.all([...document.querySelectorAll('#nu-covers img')].map(i=>{i.loading='eager';return i.decode()}))`);
 console.log('Device proportions:',await evaluate(`(()=>{const p=document.querySelector('[data-cover-panel]:not([hidden])');const phone=p.querySelector('.nu-device-phone').getBoundingClientRect();const desktop=p.querySelector('.nu-device-desktop').getBoundingClientRect();return {phoneRatio:phone.height/phone.width,desktopRatio:desktop.height/desktop.width};})()`));
 await evaluate(`document.querySelector('.nu-social-stage').scrollIntoView({behavior:'instant'});window.scrollBy({top:-90,behavior:'instant'})`);let shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync('tmp/nu-realistic-devices.png',Buffer.from(shot.data,'base64'));
 await send('Page.navigate',{url:'file:///D:/National%20University/johannescls-pr/creative.html'});await new Promise(r=>setTimeout(r,900));
 await evaluate(`Promise.all([...document.querySelectorAll('.nu-format-preview img')].map(i=>{i.loading='eager';return i.decode()}))`);
 console.log('Collection previews:',await evaluate(`({cards:document.querySelectorAll('.nu-format-card').length,images:document.querySelectorAll('.nu-format-preview img').length,broken:[...document.querySelectorAll('.nu-format-preview img')].filter(i=>!i.naturalWidth).length})`));
 await evaluate(`document.querySelector('.nu-more-formats').scrollIntoView({behavior:'instant'});window.scrollBy({top:-95,behavior:'instant'})`);shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync('tmp/nu-collection-previews.png',Buffer.from(shot.data,'base64'));
 for(const width of [390,820,1920]){await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width===390});console.log('Creative overflow '+width+':',await evaluate(`document.documentElement.scrollWidth>innerWidth`));}
 await send('Browser.close');ws.close();
})().catch(e=>{console.error(e);process.exit(1);});
