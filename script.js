const $=(s,p=document)=>p.querySelector(s),$$=(s,p=document)=>[...p.querySelectorAll(s)];
$('#year').textContent=new Date().getFullYear();

// Dragging the photo controls the whole character: it moves + tilts as one object.
// The portrait image itself is never distorted independently.
const stage=$('#characterStage'), world=$('#characterWorld'), photo=$('#photoCard'), particles=$('#characterParticles');
let dragX=0, dragY=0, startX=0, startY=0, baseX=0, baseY=0, dragging=false, activePointer=null;
let tiltX=0, tiltY=0, tiltZ=0, lastClientX=0, lastClientY=0;
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
function setWorldPosition(x,y){
  if(!stage||!world)return;
  const sr=stage.getBoundingClientRect(), pr=photo.getBoundingClientRect();
  const maxX=Math.max(30,(sr.width-pr.width)/2-10), maxY=Math.max(30,(sr.height-pr.height)/2-10);
  dragX=clamp(x,-maxX,maxX); dragY=clamp(y,-maxY,maxY);
  world.style.setProperty('--drag-x',`${dragX}px`); world.style.setProperty('--drag-y',`${dragY}px`);
}
function setTilt(x,y,z=0){
  tiltX=clamp(x,-16,16); tiltY=clamp(y,-16,16); tiltZ=clamp(z,-5,5);
  world.style.setProperty('--tilt-x',`${tiltX}deg`);
  world.style.setProperty('--tilt-y',`${tiltY}deg`);
  world.style.setProperty('--tilt-z',`${tiltZ}deg`);
}
function resetTilt(){
  world.classList.add('is-settling');
  setTilt(0,0,0);
  window.setTimeout(()=>world.classList.remove('is-settling'),480);
}
function resetCharacter(){setWorldPosition(0,0);resetTilt();}
if(stage&&world&&photo){
  const count=18;
  for(let i=0;i<count;i++){
    const p=document.createElement('span');p.className='particle';
    p.style.left=`${8+Math.random()*84}%`;p.style.top=`${8+Math.random()*84}%`;
    particles.appendChild(p);
  }

  stage.addEventListener('pointermove',e=>{
    if(dragging)return;
    const r=stage.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    $('.aura-one',world).style.transform=`translate(${x*18}px,${y*18}px)`;
    $('.aura-two',world).style.transform=`translate(${x*-12}px,${y*-12}px) rotate(${x*3}deg)`;
    $('.orbit-a',world).style.transform=`translate(${x*8}px,${y*8}px) rotate(${12+x*8}deg)`;
    $('.orbit-b',world).style.transform=`translate(${x*-10}px,${y*-10}px) rotate(${-22+y*8}deg)`;
    $$('.character-label',world).forEach((el,i)=>el.style.transform=`translate(${x*(i?-12:12)}px,${y*(i?-12:12)}px)`);
    $$('.particle',world).forEach((p,i)=>{const depth=(i%4+1)*3;p.style.transform=`translate(${x*depth}px,${y*depth}px)`});
  });
  stage.addEventListener('pointerleave',()=>{
    if(dragging)return;
    $$('.character-aura,.orbit,.character-label,.particle',world).forEach(el=>el.style.transform='');
  });

  photo.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse' && e.button!==0)return;
    dragging=true; activePointer=e.pointerId;
    startX=lastClientX=e.clientX; startY=lastClientY=e.clientY; baseX=dragX; baseY=dragY;
    photo.classList.add('dragging'); world.classList.add('is-dragging'); world.classList.remove('is-settling');
    photo.setPointerCapture?.(e.pointerId); e.preventDefault();
    const st=$('#statusText'); if(st)st.textContent='Move the character';
  });
  photo.addEventListener('pointermove',e=>{
    if(!dragging||e.pointerId!==activePointer)return;
    const dx=e.clientX-lastClientX, dy=e.clientY-lastClientY;
    setWorldPosition(baseX+e.clientX-startX,baseY+e.clientY-startY);
    // Horizontal drag rolls the character; vertical drag pitches it.
    // A small opposite Z roll makes the movement feel physical without distorting the portrait.
    setTilt(dx*0.7, -dy*0.7, dx*0.18);
    lastClientX=e.clientX; lastClientY=e.clientY;
  });
  function endDrag(e){
    if(!dragging || (e.pointerId!==undefined&&e.pointerId!==activePointer))return;
    dragging=false; photo.classList.remove('dragging'); world.classList.remove('is-dragging');
    try{photo.releasePointerCapture?.(activePointer)}catch(_){ }
    activePointer=null;
    resetTilt();
    const st=$('#statusText'); if(st)st.textContent='Character online';
  }
  photo.addEventListener('pointerup',endDrag); photo.addEventListener('pointercancel',endDrag);
  photo.addEventListener('keydown',e=>{
    const step=e.shiftKey?30:12;
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
      e.preventDefault();
      if(e.key==='ArrowLeft'){setWorldPosition(dragX-step,dragY);setTilt(-10,0,-2)}
      if(e.key==='ArrowRight'){setWorldPosition(dragX+step,dragY);setTilt(10,0,2)}
      if(e.key==='ArrowUp'){setWorldPosition(dragX,dragY-step);setTilt(0,10,0)}
      if(e.key==='ArrowDown'){setWorldPosition(dragX,dragY+step);setTilt(0,-10,0)}
      const st=$('#statusText');if(st)st.textContent='Character moved';
      window.clearTimeout(photo._keyTiltTimer); photo._keyTiltTimer=window.setTimeout(resetTilt,280);
    }
    if(e.key==='Home'){e.preventDefault();resetCharacter();}
  });
}

// Desktop tilt is reserved for cards, never the user's photo.
if(window.matchMedia('(pointer:fine)').matches){
  $$('.tilt-card').forEach(card=>{
    card.addEventListener('mousemove',e=>{const r=card.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;card.style.transform=`perspective(700px) rotateX(${-y/r.height*7}deg) rotateY(${x/r.width*8}deg) translateY(-3px)`});
    card.addEventListener('mouseleave',()=>card.style.transform='');
  });
}

// Interactive status chips.
const toast=$('#toast'),statusText=$('#statusText');let toastTimer;
$$('.character-chip').forEach(btn=>btn.addEventListener('click',()=>{statusText.textContent='Signal received';toast.textContent=btn.dataset.message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>{toast.classList.remove('show');statusText.textContent='Character online'},2200)}));

// Skill cards react on touch/click as well as hover.
$$('.skill-card').forEach(card=>card.addEventListener('click',()=>{toast.textContent=`Exploring ${card.dataset.skill}`;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),1500)}));

// Magnetic buttons on desktop.
if(window.matchMedia('(pointer:fine)').matches){$$('.magnetic').forEach(el=>{el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)*.12,y=(e.clientY-r.top-r.height/2)*.12;el.style.transform=`translate(${x}px,${y}px)`});el.addEventListener('mouseleave',()=>el.style.transform='')})}

// Custom cursor.
if(window.matchMedia('(pointer:fine)').matches){const dot=$('.cursor-dot'),ring=$('.cursor-ring');window.addEventListener('mousemove',e=>{dot.style.opacity=ring.style.opacity='1';dot.style.left=ring.style.left=e.clientX+'px';dot.style.top=ring.style.top=e.clientY+'px'});$$('a,button,.skill-card').forEach(el=>{el.addEventListener('mouseenter',()=>document.body.classList.add('cursor-active'));el.addEventListener('mouseleave',()=>document.body.classList.remove('cursor-active'))})}

// Scroll reveal.
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});$$('.reveal').forEach(el=>observer.observe(el));

// Active navigation + compact header.
const sections=$$('main section[id]'),navLinks=$$('.nav-link'),header=$('#siteHeader');
window.addEventListener('scroll',()=>{header.classList.toggle('scrolled',scrollY>30);const current=sections.reduce((active,section)=>{const distance=Math.abs(section.getBoundingClientRect().top-140);return distance<active.distance?{id:section.id,distance}:active},{id:'home',distance:Infinity});navLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')===`#${current.id}`))},{passive:true});

// Mobile navigation.
const toggle=$('#menuToggle'),menu=$('#mobileMenu');
function closeMenu(){toggle.classList.remove('open');toggle.setAttribute('aria-expanded','false');menu.classList.remove('open');document.body.classList.remove('menu-open')}
toggle.addEventListener('click',()=>{const open=!menu.classList.contains('open');toggle.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));menu.classList.toggle('open',open);document.body.classList.toggle('menu-open',open)});$$('a',menu).forEach(a=>a.addEventListener('click',closeMenu));
