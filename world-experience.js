let sensorEnabled=false;
function initWorld(){
  const world=screen.querySelector('.world');
  yaw=0;pitch=0;drag=null;moved=false;sensorBase=null;bubbles=[];
  let viewYaw=0,viewPitch=0;
  const scene=document.createElement('div');scene.className='bubble-space';world.append(scene);
  world.tabIndex=0;world.setAttribute('aria-label','Espacio de burbujas 360 grados. Arrastra o usa las flechas para mirar alrededor.');
  for(let i=0;i<180;i++){
    const empty=i%4===0,index=i%memories.length;
    const el=document.createElement(empty?'div':'button');el.className='bubble'+(empty?' empty':'');el.hidden=true;
    if(!empty){el.innerHTML=`<img src="thumbnails/imagen${index+1}.jpg" alt="" draggable="false">`;el.setAttribute('aria-label',memories[index][0]);el.onclick=e=>{if(!moved||e.detail===0){selected=index;go(3)}}}
    // Distinct radii create foreground, middle distance and distant layers.
    const radius=480+(i*433%1500),angle=i*2.3999632297;
    const b={el,x:Math.sin(angle)*radius,z:Math.cos(angle)*radius,
      y:(i*283%2800)-1400,speed:24+i%7*7,size:empty?55+i%45:165+i%6*22,
      hover:false,focus:false,delay:(i%30)*.045};
    el.onpointerenter=e=>{if(e.pointerType==='mouse'&&!drag)b.hover=true};
    el.onpointerleave=()=>b.hover=false;
    el.onfocus=()=>b.focus=true;el.onblur=()=>b.focus=false;
    scene.append(el);bubbles.push(b);
  }
  world.onpointerdown=e=>{
    if(e.target.closest('.sensor,.recenter'))return;
    drag={x:e.clientX,y:e.clientY,yaw,pitch,id:e.pointerId};moved=false;
    world.classList.add('dragging');
  };
  world.onpointermove=e=>{
    if(!drag||drag.id!==e.pointerId)return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if(Math.abs(dx)+Math.abs(dy)>7){
      moved=true;world.setPointerCapture(e.pointerId);
      bubbles.forEach(b=>b.hover=false);
    }
    yaw=drag.yaw-dx/Math.max(320,world.clientWidth)*Math.PI*1.5;
    pitch=Math.max(-1.45,Math.min(1.45,drag.pitch+dy/world.clientHeight*Math.PI));
  };
  const release=e=>{
    if(world.hasPointerCapture(e.pointerId))world.releasePointerCapture(e.pointerId);
    drag=null;world.classList.remove('dragging');
    // A drag must never select the bubble underneath the release point.
    setTimeout(()=>{moved=false},0);
  };
  world.onpointerup=release;world.onpointercancel=release;world.onlostpointercapture=()=>{drag=null;world.classList.remove('dragging')};
  world.onkeydown=e=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
    e.preventDefault();yaw+=(e.key==='ArrowRight'?.14:e.key==='ArrowLeft'?-.14:0);
    pitch=Math.max(-1.45,Math.min(1.45,pitch+(e.key==='ArrowUp'?.12:e.key==='ArrowDown'?-.12:0)));
  };
  let last=performance.now(),start=last;
  function frame(now){
    if(page!==2)return;
    const dt=Math.min((now-last)/1000,.05);last=now;
    const smoothing=1-Math.exp(-dt*13);
    viewYaw+=(yaw-viewYaw)*smoothing;viewPitch+=(pitch-viewPitch)*smoothing;
    const w=world.clientWidth,h=world.clientHeight;
    for(const b of bubbles){
      const active=(b.hover||b.focus)&&!drag;
      if(!active)b.y+=b.speed*dt;
      if(b.y>1400)b.y=-1400;
      const p=World360.project(b.x,b.y,b.z,viewYaw,viewPitch,w,h);
      const size=active?154:Math.min(300,b.size*(p?.scale||0));
      const visible=p&&p.x>-size&&p.x<w+size&&p.y>-size&&p.y<h+size;
      b.el.hidden=!visible;
      if(!visible)continue;
      const appear=Math.max(0,Math.min(1,((now-start)/1000-b.delay)*1.5));
      b.el.style.width=b.el.style.height=size+'px';
      b.el.style.transform=`translate3d(${p.x-size/2}px,${p.y-size/2}px,0) scale(${appear})`;
      b.el.style.opacity=active?1:Math.max(.32,1-p.depth/3600);
      b.el.style.zIndex=active?4000:Math.max(1,3000-Math.round(p.depth));
      b.el.style.filter=active?'none':`blur(${Math.max(0,(p.depth-1300)/1600)}px)`;
    }
    world.style.setProperty('--pan-x',`${50+Math.sin(viewYaw)*30}%`);
    world.style.setProperty('--pan-y',`${50+viewPitch*22}%`);
    raf=requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);
}
async function enableSensor(){
  if(sensorEnabled)return;
  try{
    if(!window.isSecureContext||!window.DeviceOrientationEvent)return;
    if(typeof DeviceOrientationEvent.requestPermission==='function'&&await DeviceOrientationEvent.requestPermission()!=='granted')return;
    sensorBase=null;sensorEnabled=true;
    window.addEventListener('deviceorientation',orientation);
  }catch{sensorEnabled=false}
}
function orientation(e){
  if(page!==2||!sensorEnabled||drag||![e.alpha,e.beta,e.gamma].every(Number.isFinite))return;
  const q=World360.quaternion(e.alpha,e.beta,e.gamma);
  if(!sensorBase)sensorBase={q,yaw,pitch,lastYaw:0};
  const relative=World360.relative(sensorBase.q,q);
  const delta=Math.atan2(Math.sin(relative.yaw-sensorBase.lastYaw),Math.cos(relative.yaw-sensorBase.lastYaw));
  yaw+=delta;sensorBase.lastYaw=relative.yaw;
  pitch=Math.max(-1.45,Math.min(1.45,sensorBase.pitch+relative.pitch));
}
