const fs=require('node:fs');
(async()=>{
const tabs=await(await fetch('http://127.0.0.1:9333/json')).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.onopen=r);let id=0;const waiting=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){waiting.get(m.id)(m.result);waiting.delete(m.id)}};
const send=(method,params={})=>new Promise(r=>{waiting.set(++id,r);ws.send(JSON.stringify({id,method,params}))});
const ev=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result.value;
await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
await send('Page.navigate',{url:'file:///D:/National%20University/johannescls-pr/it.html'});
await new Promise(r=>setTimeout(r,1200));
await ev(`Promise.all([...document.querySelectorAll('.luminus-team img')].map(i=>{i.loading='eager';return i.decode()})).then(()=>document.fonts.ready).then(()=>true)`);
for(const width of [320,390,768,1440]){
await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:true});
await ev(`document.querySelector('.luminus-team').scrollIntoView({behavior:'instant'})`);
const result=await ev(`(()=>{const team=document.querySelector('.luminus-team');const cards=[...team.querySelectorAll('li')];const images=[...team.querySelectorAll('img')];const d=team.querySelector('details');d.open=true;const expandedFits=d.scrollWidth<=d.clientWidth;d.open=false;return {width:innerWidth,count:cards.length,photosLoaded:images.every(i=>i.naturalWidth>0),fits:cards.every(c=>{const r=c.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth}),expandedFits,lastSection:!team.nextElementSibling}})()`);
console.log(result);if(result.count!==4||!result.photosLoaded||!result.fits||!result.expandedFits||!result.lastSection)throw Error('Team check failed');
if(width===390||width===1440){const shot=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync('tmp/team-'+width+'.png',Buffer.from(shot.data,'base64'))}
}
await send('Browser.close');ws.close();
})().catch(e=>{console.error(e);process.exit(1)});
