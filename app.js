const screen=document.querySelector('#screen');
const memories=[['Una canción que te devuelve','grayscale(1) contrast(1.12)','Ecos'],['Alguien que se quedó contigo','grayscale(.85) sepia(.25)','Ausencia'],['Respirar sin prisa','sepia(.25) saturate(.7) hue-rotate(12deg)','Calma'],['Correr hasta que caiga el sol','sepia(.25) saturate(1.4) hue-rotate(335deg)','Atardecer'],['Cuando todo era un descubrimiento','sepia(.38) saturate(.8) brightness(1.1)','Infancia'],['Un lugar al que volver','sepia(.5) saturate(1.25)','Luz dorada'],['Lo que aún nos une','sepia(.7) saturate(.6) contrast(.95)','Abrazo'],['La magia de elegir un juguete','saturate(1.5) contrast(1.08) sepia(.12)','Asombro'],['Las noches que eran nuestras','grayscale(.3) sepia(.2) hue-rotate(15deg) contrast(1.18)','Complicidad'],['Todos alrededor de la mesa','sepia(.35) saturate(.85) contrast(.9) brightness(1.08)','Sobremesa'],['Un mundo entero en tus manos','sepia(.42) saturate(.65) hue-rotate(345deg) brightness(1.06)','Imaginación'],['La calma de tenerte cerca','sepia(.22) saturate(.9) brightness(1.08) contrast(.92)','Ronroneo'],['Quien siempre te recibe con cariño','saturate(.78) sepia(.16) brightness(1.12) contrast(1.03)','Lealtad'],['Un baile que abraza generaciones','sepia(.48) saturate(.72) contrast(.94) brightness(1.04)','Raíces'],['Caminar juntos bajo las luces','saturate(1.3) contrast(1.12) hue-rotate(350deg) brightness(.98)','Verbena']];
let page=0,selected=3,emotion='',photo='',stream=null,facing='user',raf=0,epoch=0,yaw=0,pitch=0,drag=null,moved=false,bubbles=[],sensorBase=null,muted=true,audioContext=null,osc=null;
const img=i=>`imagenes/imagen${i+1}.jpg`;
const button=(text,id)=>`<button class="pill" id="${id}">${text}</button>`;
function bind(id,fn){document.getElementById(id)?.addEventListener('click',fn)}
const storyCopy={
  1:{title:'Hay momentos que terminan, pero nunca se van del todo.',body:'A veces basta una canción, un olor o una fotografía para volver a un lugar al que creíamos que ya no podíamos regresar.',button:'Volver por un instante'},
  3:{title:'¿Qué momento de tu vida te gustaría vivir una vez más, aunque fuera solo por unos segundos?',body:'No tiene que ser un día extraordinario. A veces, los momentos más simples son los que más extrañamos.',button:'Quiero volver ahí'},
  9:{title:'En ese momento no sabías cuánto ibas a extrañarlo.',body:'Tal vez era una tarde cualquiera, una risa que parecía interminable o alguien que estaba a tu lado. No sabías que algún día desearías regresar.',button:'Quedarme un poco más'},
  10:{title:'Si pudieras volver, ¿abrazarías a alguien, dirías algo diferente o simplemente te quedarías un poquito más?',body:'A veces no extrañamos un lugar ni una fecha. Extrañamos a quienes éramos cuando estábamos ahí.',button:'Hay algo que aún extraño'},
  11:{title:'Lo más difícil de algunos recuerdos es saber que no podemos volver a ellos de la misma manera.',body:'Pero qué bonito haber estado ahí. Haber sentido tanto. Haber vivido algo que, incluso después de tanto tiempo, todavía tiene un lugar en ti.',button:'Guardar este instante'},
  8:{title:'Quizá no podamos regresar a ese momento… pero hay algo que el tiempo nunca pudo quitarte: haberlo vivido.',body:'Y mientras sigas recordándolo, una pequeña parte de ese instante seguirá contigo.',button:'Volver al presente'}
};
function storyMarkup(n,extra=''){
  const copy=storyCopy[n];
  return `<section class="center intro story-screen${extra?' story-with-memory':''}"><div class="story-content">${extra}<h2>${copy.title}</h2><div class="rule"></div><p>${copy.body}</p>${[1,3,9,10].includes(n)?'':button(copy.button,'story-next')}</div></section>`;
}
function bindStoryNext(fn){
  if(![1,3,9,10].includes(page)){bind('story-next',fn);return}
  const content=screen.querySelector('.story-content');
  content.tabIndex=0;
  content.setAttribute('role','button');
  content.setAttribute('aria-label','Continuar al tocar el texto');
  content.onclick=fn;
  content.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn()}};
}
function animateStory(){typewrite(screen.querySelectorAll('.story-content h2,.story-content p'))}
function stopCamera(){stream?.getTracks().forEach(t=>t.stop());stream=null}
async function go(n,blur=true){const token=++epoch;if(blur){document.body.classList.add('changing');await new Promise(r=>setTimeout(r,380));}if(token!==epoch)return;cancelAnimationFrame(raf);if(page===5)stopCamera();page=n;render();document.body.classList.remove('changing')}
function render(){document.body.classList.toggle('home-screen',page===0);screen.onpointermove=null;screen.onpointerdown=null;screen.onpointerup=null;screen.onpointercancel=null;
if(page===0){screen.style.removeProperty('--left');screen.style.removeProperty('--top');screen.innerHTML=`<section class="center home-discovery"><div class="discovery-content"><h1>Vuelve a<br><em>sentir.</em></h1>${button('INICIAR','start')}</div></section><div class="discovery-blur" aria-hidden="true"></div><div class="discovery-window" aria-hidden="true"></div><p class="discovery-hint">MUEVE EL CURSOR<br>MANTÉN Y DESLIZA EL DEDO</p>`;screen.onpointerdown=e=>{drag=e.pointerId;if(!e.target.closest('button'))screen.setPointerCapture(e.pointerId);reveal(e)};screen.onpointerup=e=>{if(screen.hasPointerCapture(e.pointerId))screen.releasePointerCapture(e.pointerId);drag=null};screen.onpointercancel=()=>drag=null;screen.onpointermove=e=>{if(e.pointerType==='mouse'||drag===e.pointerId)reveal(e)};bind('start',()=>go(1));document.getElementById('start').onfocus=e=>{const r=e.target.getBoundingClientRect();reveal({clientX:r.left+r.width/2,clientY:r.top+r.height/2+45})}}
if(page===1){screen.innerHTML=storyMarkup(1);animateStory();let entering=false;bindStoryNext(()=>{if(entering)return;entering=true;enterMemories()})}
if(page===2){screen.innerHTML=`<section class="memory-world"><div class="world-copy"><h2>Quizá no recuerdes el día exacto… pero sí cómo te hizo sentir.</h2><p>Hay recuerdos que siguen aquí, esperando algo pequeño que los despierte. Acércate a aquellos que todavía guardan una parte de ti.</p></div><section class="world"><p class="world-instruction">Toca una burbuja y deja que el recuerdo te encuentre.</p></section></section>`;initWorld()}
if(page===3){screen.innerHTML=storyMarkup(3,`<div class="memory" style="filter:${memories[selected][1]}"><img src="gifs/recuerdo${selected+1}.gif" onerror="this.onerror=null;this.src='${img(selected)}'" alt="${memories[selected][0]}"></div>`);animateStory();bindStoryNext(()=>go(9))}
if([9,10,11].includes(page)){screen.innerHTML=storyMarkup(page);animateStory();bindStoryNext(()=>go(page===9?10:page===10?11:4))}
if(page===4){screen.innerHTML=`<section class="center emotion-screen"><h2 class="emotion-title">¿Qué emoción sigue<br>contigo al recordarlo?</h2><div class="emotions">${['Tranquilidad','Alegría','Cariño','Libertad','Tristeza'].map((t,i)=>`<button class="emotion" data-emotion="${t}"><i style="--color:${['#e6d498','#e84a65','#d94234','#315448','#283baf'][i]}"></i>${t.toUpperCase()}</button>`).join('')}</div></section>`;screen.querySelectorAll('[data-emotion]').forEach(b=>b.onclick=()=>{emotion=b.dataset.emotion;go(5)})}
if(page===5){screen.innerHTML=`<section class="center camera-screen"><p class="eyebrow">GUARDA CÓMO TE SIENTES HOY</p><div class="camera-box"><video autoplay muted playsinline style="filter:${memories[selected][1]}"></video></div><p class="status" id="camera-status" role="status"></p><div class="camera-controls"><button class="icon" id="upload" aria-label="Usar una fotografía">＋</button><button class="shutter" id="capture" aria-label="Tomar foto"></button><button class="icon" id="flip" aria-label="Cambiar cámara">↻</button></div><input id="file" type="file" accept="image/*" hidden></section>`;startCamera();bind('flip',()=>{facing=facing==='user'?'environment':'user';startCamera()});bind('capture',capture);bind('upload',()=>document.getElementById('file').click());document.getElementById('file').onchange=e=>{const f=e.target.files[0];if(!f)return;const url=URL.createObjectURL(f);const im=new Image();im.onload=()=>{makePhoto(im);URL.revokeObjectURL(url);reviewPhoto()};im.src=url}}
if(page===6){screen.innerHTML=`<section class="center developing-screen"><h2 class="emotion-title">Este instante<br>también será un recuerdo…</h2><div class="camera-stage"><img src="camara.png" alt="Cámara instantánea"><figure class="polaroid eject"><img src="${photo}" alt="Tu foto revelándose"></figure></div></section>`;const token=epoch;setTimeout(()=>{if(page===6&&token===epoch)go(7)},4200)}
if(page===7){screen.innerHTML=`<section class="center result"><p class="memory-copy">Un instante de hoy.<br>Una parte de ti para recordar mañana.</p><figure class="polaroid"><img src="${photo}" alt="Tu recuerdo con filtro ${memories[selected][2]}"></figure><div class="row"><button class="icon" id="save" aria-label="Guardar este instante">↓</button><button class="icon" id="retry" aria-label="Volver a tomar la foto">↶</button><button class="icon" id="finish" aria-label="Volver al presente">→</button></div><p class="sr-only" id="save-status" role="status"></p></section>`;bind('save',savePhoto);bind('retry',()=>go(5));bind('finish',()=>go(8))}
if(page===8){screen.innerHTML=storyMarkup(8);animateStory();bindStoryNext(()=>go(0))}}
function reveal(e){const r=screen.getBoundingClientRect();screen.style.setProperty('--left',`${Math.max(0,Math.min(r.width-160,e.clientX-r.left-80))}px`);screen.style.setProperty('--top',`${Math.max(0,Math.min(r.height-190,e.clientY-r.top-95))}px`)}
async function startCamera(){stopCamera();const token=epoch;try{const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:facing,width:{ideal:1280}},audio:false});if(page!==5||token!==epoch){s.getTracks().forEach(t=>t.stop());return}stream=s;screen.querySelector('video').srcObject=stream;await screen.querySelector('video').play();document.getElementById('camera-status').textContent=''}catch{if(page!==5)return;document.getElementById('camera-status').textContent='No se pudo abrir la cámara. Usa + para elegir una foto o habilita el permiso del navegador.';document.getElementById('capture').disabled=true}}
function makePhoto(source){const c=document.createElement('canvas');c.width=900;c.height=1100;const ctx=c.getContext('2d');const w=source.videoWidth||source.naturalWidth,h=source.videoHeight||source.naturalHeight;const ratio=Math.max(c.width/w,c.height/h);ctx.filter=memories[selected][1];ctx.drawImage(source,(c.width-w*ratio)/2,(c.height-h*ratio)/2,w*ratio,h*ratio);photo=c.toDataURL('image/jpeg',.9)}
function capture(){const v=screen.querySelector('video');if(!v?.videoWidth)return;makePhoto(v);screen.classList.add('flash');setTimeout(()=>{screen.classList.remove('flash');reviewPhoto()},250)}
async function savePhoto(){const im=new Image();im.src=photo;await im.decode();const c=document.createElement('canvas');c.width=1000;c.height=1400;const ctx=c.getContext('2d');ctx.fillStyle='#f2eedc';ctx.fillRect(0,0,1000,1400);ctx.drawImage(im,50,50,900,1100);ctx.fillStyle='#504335';ctx.font='24px IBM';ctx.fillText(`${emotion} · ${new Date().toLocaleDateString('es-MX')}`,55,1250);ctx.font='bold 36px Mont';ctx.fillText('mali',55,1330);const a=document.createElement('a');a.download='mi-recuerdo-mali.jpg';a.href=c.toDataURL('image/jpeg',.95);a.click();document.getElementById('save-status').textContent='Tu polaroid está lista para guardar.'}
function reviewPhoto(){
  if(page!==5||!photo)return;
  stopCamera();
  screen.innerHTML=`<section class="center camera-screen photo-review"><p class="eyebrow">TU FOTO</p><div class="camera-box"><img src="${photo}" alt="Vista previa de tu foto con el filtro elegido"></div><div class="review-actions"><button class="pill" id="retake">VOLVER A TOMAR</button><button class="pill" id="accept-photo">CONTINUAR →</button></div></section>`;
  bind('retake',()=>{photo='';render()});
  bind('accept-photo',()=>go(6));
}
window.addEventListener('pagehide',stopCamera);render();









