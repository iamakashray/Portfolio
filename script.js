const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const loader=$('#loader');
document.body.classList.add('loading');
window.addEventListener('load',()=>setTimeout(()=>{loader.classList.add('done');document.body.classList.remove('loading')},1500));
$('#year').textContent=new Date().getFullYear();

const header=$('#header');
window.addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>30),{passive:true});

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.12});
$$('.reveal').forEach(el=>observer.observe(el));

const sections=$$('main section[id]'), navLinks=$$('.nav-link');
const sectionObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id))}}),{rootMargin:'-35% 0px -55%'});
sections.forEach(s=>sectionObserver.observe(s));

const menuBtn=$('#menuBtn'),nav=$('#nav');
menuBtn?.addEventListener('click',()=>nav.classList.toggle('open'));
navLinks.forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

const photo=$('#photoWrap');
if(photo&&matchMedia('(pointer:fine)').matches){
 photo.addEventListener('pointermove',e=>{const r=photo.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;photo.style.transform=`rotateX(${(-y*10).toFixed(2)}deg) rotateY(${(x*12).toFixed(2)}deg) scale3d(1.015,1.015,1.015)`;});
 photo.addEventListener('pointerleave',()=>photo.style.transform='');
}
$$('.tilt').forEach(card=>{if(!matchMedia('(pointer:fine)').matches)return;card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(800px) rotateX(${(-y*5).toFixed(2)}deg) rotateY(${(x*6).toFixed(2)}deg) translateY(-4px)`});card.addEventListener('pointerleave',()=>card.style.transform='')});

const dot=$('.cursor-dot'),ring=$('.cursor-ring');let mx=0,my=0,rx=0,ry=0;
if(dot&&matchMedia('(pointer:fine)').matches){window.addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;dot.style.transform=`translate(${mx-3}px,${my-3}px)`});const loop=()=>{rx+=(mx-rx)*.15;ry+=(my-ry)*.15;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(loop)};loop();$$('a,.skill-card,.hobby').forEach(el=>{el.addEventListener('mouseenter',()=>{ring.style.width='52px';ring.style.height='52px';ring.style.background='rgba(201,255,67,.06)'});el.addEventListener('mouseleave',()=>{ring.style.width='34px';ring.style.height='34px';ring.style.background='transparent'})})}

if(matchMedia('(pointer:fine)').matches){$$('.magnetic').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;el.style.transform=`translate(${x*.12}px,${y*.18}px)`});el.addEventListener('pointerleave',()=>el.style.transform='')})}

// Subtle parallax for the background blobs and stage rings.
window.addEventListener('scroll',()=>{const y=scrollY;document.querySelector('.blob-a').style.transform=`translate3d(${y*.015}px,${y*.025}px,0)`;document.querySelector('.blob-b').style.transform=`translate3d(${-y*.012}px,${-y*.018}px,0)`},{passive:true});

// Touch devices: keep mobile smooth by avoiding pointer/scroll-driven transforms.
const isTouch = matchMedia('(hover: none), (pointer: coarse)').matches;
if(isTouch){
  const photoEl=$('#photoWrap');
  photoEl?.removeAttribute('style');
  // Disable the desktop-only background parallax scroll handler by keeping blobs static.
  const ba=document.querySelector('.blob-a'), bb=document.querySelector('.blob-b');
  if(ba) ba.style.transform='none';
  if(bb) bb.style.transform='none';
}
