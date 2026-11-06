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
 async function capture(name){await evaluate(`document.querySelector('.nu-cover-studio').scrollIntoView({behavior:'instant'});window.scrollBy({top:-90,behavior:'instant'})`);const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync('tmp/'+name,Buffer.from(shot.data,'base64'));}
 await capture('nu-social-both.png');
 console.log('Initial devices:',await evaluate(`({mode:document.querySelector('.nu-cover-studio').dataset.deviceMode,desktop:!document.querySelector('[data-cover-panel]:not([hidden]) .nu-device-desktop').hidden,phone:!document.querySelector('[data-cover-panel]:not([hidden]) .nu-device-phone').hidden})`));
 await evaluate(`document.querySelectorAll('[data-cover-select]')[2].click()`);
 console.log('Campaign sync:',await evaluate(`(()=>{const p=document.querySelector('[data-cover-panel]:not([hidden])');return [...p.querySelectorAll('.nu-social-cover img')].every(i=>i.src.includes('2026_FBCover'));})()`));
 await evaluate(`document.querySelector('[data-device-view="phone"]').click()`);await capture('nu-social-phone.png');
 console.log('Phone mode:',await evaluate(`document.querySelector('[data-cover-panel]:not([hidden]) .nu-device-desktop').hidden`));
 console.log('Follow preview:',await evaluate(`(()=>{document.querySelector('[data-cover-panel]:not([hidden]) .nu-device-phone [data-preview-follow]').click();return [...document.querySelectorAll('[data-preview-follow]')].every(b=>b.getAttribute('aria-pressed')==='true')})()`));
 await evaluate(`document.querySelector('[data-cover-panel]:not([hidden]) [data-phone-cover]').click()`);console.log('Phone zoom:',await evaluate(`document.querySelector('#lightbox').open`));await evaluate(`document.querySelector('#lightbox').close()`);
 await evaluate(`document.querySelector('[data-device-view="desktop"]').click()`);console.log('Desktop mode:',await evaluate(`document.querySelector('[data-cover-panel]:not([hidden]) .nu-device-phone').hidden`));
 for(const width of [390,820,1920]){
   await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width===390});
   for(const mode of ['both','desktop','phone']) {await evaluate(`document.querySelector('[data-device-view="${mode}"]').click()`);console.log('Overflow '+width+'/'+mode+':',await evaluate(`document.documentElement.scrollWidth>innerWidth`));}
   if(width===390) await capture('nu-social-mobile.png');
 }
 await send('Browser.close');ws.close();
})().catch(e=>{console.error(e);process.exit(1);});
