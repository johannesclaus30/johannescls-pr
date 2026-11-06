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


 console.log('Matchups:',await evaluate(`(()=>{const g=document.querySelector('[data-nu-matchday]');const b=[...g.querySelectorAll('[data-match-select]')];const active=()=>[...g.querySelectorAll('[data-match-panel]')].findIndex(p=>!p.hidden);g.querySelector('[data-match-next]').click();const first=active();g.querySelector('[data-match-next]').click();b[0].focus();b[0].dispatchEvent(new KeyboardEvent('keydown',{key:'End',bubbles:true}));return {choices:b.length,firstSwitch:first,keyboard:active(),status:g.querySelector('[data-match-status]').textContent,finalsInMatchday:g.textContent.includes('Go for the gold')};})()`));
 console.log('Campaigns:',await evaluate(`({cards:document.querySelectorAll('.nu-campaign-card').length,finals:document.querySelector('#nu-campaigns').textContent.includes('Go for the gold')})`));
 await evaluate(`document.querySelectorAll('[data-cover-select]')[2].click()`);
 await snap('nu-covers','nu-cover-quality.png');
 console.log('2026 cover:',await evaluate(`(()=>{const i=document.querySelectorAll('[data-cover-panel] img')[2];return {source:i.currentSrc,natural:i.naturalWidth,display:i.getBoundingClientRect().width};})()`));
 await snap('nu-uaap','nu-two-matchups.png');
 await snap('nu-campaigns','nu-three-campaigns.png');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});
 await snap('nu-uaap','nu-two-matchups-mobile.png');
 console.log('NU mobile overflow:',await evaluate(`document.documentElement.scrollWidth>innerWidth`));
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:2,mobile:false});
 await send('Page.navigate',{url:'file:///D:/National%20University/johannescls-pr/sace.html'});
 await new Promise(r=>setTimeout(r,900));
 await evaluate(`Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{});})).then(()=>true)`);
 await evaluate(`document.querySelector('.sace-logo-feature').scrollIntoView({behavior:'instant',block:'center'})`);
 const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync('tmp/sace-logo-quality.png',Buffer.from(shot.data,'base64'));
 console.log('SACE images at 2x:',await evaluate(`[...document.querySelectorAll('#sace img')].map(i=>({file:i.currentSrc.split('/').pop(),natural:i.naturalWidth,display:Math.round(i.getBoundingClientRect().width),loaded:i.complete&&i.naturalWidth>0,source:i.currentSrc}))`));
 console.log('SACE originals:',await evaluate(`(()=>{const buttons=[...document.querySelectorAll('#sace [data-image]')];return buttons.every(b=>!b.dataset.image.includes('/optimized/'));})()`));
 await evaluate(`document.querySelector('.sace-logo-feature').click();document.querySelector('#lightbox-image').decode()`);
 console.log('Logo lightbox:',await evaluate(`({open:document.querySelector('#lightbox').open,width:document.querySelector('#lightbox-image').naturalWidth})`));
 await evaluate(`document.querySelector('#lightbox').close()`);
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true});
 console.log('SACE mobile overflow:',await evaluate(`document.documentElement.scrollWidth>innerWidth`));
 await send('Browser.close');ws.close();
})().catch(e=>{console.error(e);process.exit(1);});
