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

 console.log('Desktop print alignment:',await evaluate(`(()=>{const cards=[...document.querySelectorAll('.nu-print-object')];const boxes=cards.map(c=>c.querySelector('button').getBoundingClientRect());const captions=cards.map(c=>c.querySelector('figcaption').getBoundingClientRect());const same=(r,k)=>Math.max(...r.map(v=>v[k]))-Math.min(...r.map(v=>v[k]))<1;return {count:cards.length,top:same(boxes,'top'),height:same(boxes,'height'),captions:same(captions,'top'),railOverflow:document.querySelector('.nu-installation').scrollWidth>document.querySelector('.nu-installation').clientWidth};})()`));
 await evaluate(`document.querySelector('.nu-installation').scrollIntoView({behavior:'instant'});window.scrollBy({top:-95,behavior:'instant'})`);
 let shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync('tmp/nu-single-row-desktop.png',Buffer.from(shot.data,'base64'));
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:900,deviceScaleFactor:1,mobile:true});
 console.log('Mobile rail:',await evaluate(`(()=>{const rail=document.querySelector('.nu-installation');rail.scrollLeft=rail.scrollWidth;return {horizontal:rail.scrollWidth>rail.clientWidth,canReachLast:rail.scrollLeft>0,pageOverflow:document.documentElement.scrollWidth>innerWidth};})()`));
 await evaluate(`document.querySelector('.nu-installation').scrollIntoView({behavior:'instant'});window.scrollBy({top:-110,behavior:'instant'})`);
 shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync('tmp/nu-single-row-mobile.png',Buffer.from(shot.data,'base64'));
 console.log('Last print opens:',await evaluate(`(()=>{document.querySelectorAll('.nu-print-object button')[3].click();return document.querySelector('#lightbox').open})()`));
 await send('Browser.close');ws.close();
})().catch(e=>{console.error(e);process.exit(1);});
