const root = document.documentElement;
const page = document.body.dataset.page;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let mode = 'it';
let motionPreference = true;
try {
  mode = localStorage.getItem('jc-portfolio-mode') || 'it';
  motionPreference = localStorage.getItem('jc-motion') !== 'off';
} catch {}
function setMode(next) {
  mode = next === 'creative' ? 'creative' : 'it';
  root.dataset.mode = mode;
  document.querySelector('meta[name="theme-color"]').content = mode === 'creative' ? '#eeeae1' : '#111111';
  document.querySelectorAll('[data-switch]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.switch === mode)));
  if (page === 'home') {
    const creative = mode === 'creative';
    document.querySelector('.hero-title h1').innerHTML = creative ? 'MADE FOR<br><em id="hero-last">DAYLIGHT.</em>' : 'BUILT AFTER<br><em id="hero-last">HOURS.</em>';
    document.querySelector('#hero-description').innerHTML = creative ? 'Design, storytelling, and a different way of seeing.<br>I’m Johannes. Let’s make a little noise.' : 'Code, curiosity, and a little restless ambition.<br>I’m Johannes. Welcome to my side of the city.';
    const link = document.querySelector('#hero-link');
    link.href = creative ? 'creative.html' : 'it.html';
    link.setAttribute('aria-label',creative ? 'Explore Creative archive' : 'Explore IT work');
  }
  if (page !== 'credits') try { localStorage.setItem('jc-portfolio-mode',mode); } catch {}
}
setMode(page === 'home' ? mode : page);
document.querySelectorAll('[data-switch]').forEach(button => button.addEventListener('click',()=>setMode(button.dataset.switch)));
document.querySelectorAll('[data-year]').forEach(element=>element.textContent=new Date().getFullYear());

function motionEnabled() { return motionPreference && !reduceMotion.matches; }
function applyMotion() {
  const enabled = motionEnabled();
  root.dataset.motion = enabled ? 'on' : 'off';
  document.querySelectorAll('.motion-toggle').forEach(button=>{
    button.textContent = enabled ? 'Motion: on' : 'Motion: off';
    button.setAttribute('aria-pressed',String(!enabled));
    button.setAttribute('aria-label',enabled ? 'Turn off decorative motion' : 'Turn on decorative motion');
    button.disabled = reduceMotion.matches;
    button.title = reduceMotion.matches ? 'Reduced motion is enabled in your device settings.' : '';
  });
  updateScroll();
}
document.querySelectorAll('.motion-toggle').forEach(button=>button.addEventListener('click',()=>{
  motionPreference = !motionPreference;
  try {localStorage.setItem('jc-motion',motionPreference?'on':'off');}catch{}
  applyMotion();
}));
reduceMotion.addEventListener('change',applyMotion);
const cinema=document.querySelector('.cinema');
const interlude=document.querySelector('.photo-interlude');
const galleryHero=document.querySelector('.archive-hero, .system-hero');
let framePending=false;
const clamp=(value,min=0,max=1)=>Math.min(max,Math.max(min,value));
function updateScroll() {
  framePending=false;
  const height=root.scrollHeight-innerHeight;
  root.style.setProperty('--page-progress',height>0?clamp(scrollY/height):0);
  if (!motionEnabled()) return;
  if(cinema){
    const rect=cinema.getBoundingClientRect();
    root.style.setProperty('--hero-progress',clamp(-rect.top/Math.max(1,rect.height-innerHeight)));
  }
  if(interlude){
    const rect=interlude.getBoundingClientRect();
    root.style.setProperty('--interlude-progress',clamp((innerHeight-rect.top)/(innerHeight+rect.height),0,1)*2-1);
  }
  if(galleryHero){
    const rect=galleryHero.getBoundingClientRect();
    root.style.setProperty('--gallery-progress',clamp(-rect.top/rect.height));
  }
}
function requestFrame(){if(!framePending){framePending=true;requestAnimationFrame(updateScroll);}}
addEventListener('scroll',requestFrame,{passive:true});
addEventListener('resize',requestFrame);
addEventListener('load',requestFrame);
applyMotion();

if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}});
  },{threshold:.05});
  if(motionEnabled())document.body.classList.add('motion-ready');
  document.querySelectorAll('.reveal').forEach(element=>observer.observe(element));
  const links=[...document.querySelectorAll('.archive-nav a')];
  const sections=[...document.querySelectorAll('.organization, .system-case')];
  const sectionObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting)links.forEach(link=>{
        const active=link.hash==='#'+entry.target.id;
        link.classList.toggle('active',active);
        if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
      });
    });
  },{rootMargin:'-15% 0px -65% 0px',threshold:0});
  sections.forEach(section=>sectionObserver.observe(section));
}

// A native modal keeps focus in the viewer, supports Escape, and restores the opener.
const viewer=document.querySelector('#lightbox');
const image=document.querySelector('#lightbox-image');
const cards=[...document.querySelectorAll('[data-image]')];
let group=[],currentIndex=0;
function showImage(index){
  if(!group.length)return;
  currentIndex=(index+group.length)%group.length;
  const card=group[currentIndex];
  image.src=card.dataset.image;
  image.alt=card.querySelector('img').alt;
  document.querySelector('#lightbox-title').textContent=card.dataset.title;
  document.querySelector('#lightbox-description').textContent=card.dataset.description;
  document.querySelector('#lightbox-count').textContent=String(currentIndex+1).padStart(2,'0')+' / '+String(group.length).padStart(2,'0');
}
cards.forEach(card=>card.addEventListener('click',()=>{
  group=cards.filter(item=>item.dataset.group===card.dataset.group);
  showImage(group.indexOf(card));
  viewer.showModal();
}));
viewer.querySelector('[data-close]').addEventListener('click',()=>viewer.close());
viewer.querySelector('[data-prev]').addEventListener('click',()=>showImage(currentIndex-1));
viewer.querySelector('[data-next]').addEventListener('click',()=>showImage(currentIndex+1));
viewer.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft'){event.preventDefault();showImage(currentIndex-1);}
  if(event.key==='ArrowRight'){event.preventDefault();showImage(currentIndex+1);}
});
viewer.addEventListener('click',event=>{
  if(event.target!==viewer)return;
  const rect=viewer.getBoundingClientRect();
  if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)viewer.close();
});
