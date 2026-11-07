const fs = require('node:fs');
(async () => {
  const targets = await (await fetch('http://127.0.0.1:9333/json')).json();
  const ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r, {once:true}));
  let id = 0; const pending = new Map();
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id) { pending.get(m.id)(m.result); pending.delete(m.id); } };
  const send = (method, params = {}) => new Promise(r => { pending.set(++id,r); ws.send(JSON.stringify({id,method,params})); });
  const evaluate = async expression => (await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result?.value;
  await send('Page.enable');
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  const results=[];
  for (const page of ['index','it','creative','nu-lipa','sace','credits']) {
    await send('Page.navigate',{url:'file:///D:/National%20University/johannescls-pr/'+page+'.html'});
    await new Promise(r=>setTimeout(r,900));
    await evaluate(`Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{});})).then(()=>document.fonts.ready).then(()=>true)`);
    for (const width of [320,390,540,768,1024,1440]) {
      await send('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
      await new Promise(r=>setTimeout(r,100));
      const data=await evaluate(`(() => {const bad=[...document.querySelectorAll('body *')].filter(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect(); if(!r.width||s.position==='absolute'||s.position==='fixed')return false; for(let p=e.parentElement;p&&p!==document.body;p=p.parentElement){if(['hidden','auto','scroll','clip'].includes(getComputedStyle(p).overflowX))return false;} return r.left < -2||r.right>innerWidth+2;}).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent.trim().slice(0,45),left:Math.round(e.getBoundingClientRect().left),right:Math.round(e.getBoundingClientRect().right)})); return {overflow:document.documentElement.scrollWidth>innerWidth,bad};})()`);
      results.push({page,width,...data});
      const checks=await evaluate(`(() => {const header=document.querySelector('.nav').getBoundingClientRect(); const hero=document.querySelector('.page-hero,.home-hero,.nu-hero,.sace-hero');const links=[...document.querySelectorAll('.nav-links a')]; const hiddenLinks=links.filter(a=>getComputedStyle(a).display==='none').length; const button=document.querySelector('button[data-image]');let modalFits=true;if(button){button.click();const dialog=document.querySelector('dialog[open]');if(dialog){const r=dialog.getBoundingClientRect();modalFits=r.left>=0&&r.right<=innerWidth&&r.height<=innerHeight;dialog.close();}}return {hiddenLinks,modalFits,headerFits:header.right<=innerWidth};})()`);
      if(checks.hiddenLinks||!checks.modalFits||!checks.headerFits) throw Error(JSON.stringify({page,width,checks}));
      if(width===390&&process.argv.includes('--internal')) console.log(page,await evaluate(`[...document.querySelectorAll('main *')].filter(e=>{const s=getComputedStyle(e);return e.clientWidth>0&&e.scrollWidth>e.clientWidth+3&&s.overflowX==='visible'&&s.position!=='absolute'&&['grid','flex','block'].includes(s.display)}).map(e=>({cls:e.className,width:e.clientWidth,scroll:e.scrollWidth})).slice(0,60)`));
      if(process.argv.includes('--screenshots')&&width===390){
        for(const selector of ['.page-hero, .home-hero','#e-reklamo-manual','#internship-tracker','.brochure-experience','.synergy-carousel']) {
          if(!await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`))continue;
          await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({behavior:'instant'});`);
          await send('Page.captureScreenshot',{format:'png'}).then(s=>fs.writeFileSync('tmp/responsive-'+page+'-'+selector.replace(/[^a-z]/g,'')+'.png',Buffer.from(s.data,'base64')));
        }
        await evaluate(`scrollTo({top:0,behavior:'instant'})`);
      }
    }
  }
  fs.writeFileSync('tmp/responsive-results.json',JSON.stringify(results,null,2));
  console.log(JSON.stringify(results.filter(r=>r.overflow||r.bad.length),null,2));
  ws.close();
})().catch(e=>{console.error(e);process.exit(1)});
