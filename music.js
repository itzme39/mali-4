const backgroundMusic=document.getElementById('background-music');
const musicToggle=document.getElementById('music-toggle');
let musicPreference=null;
backgroundMusic.volume=.35;
function updateMusicButton(){
  const playing=!backgroundMusic.paused&&!backgroundMusic.muted;
  const label=playing?'Silenciar música de fondo':'Activar música de fondo';
  musicToggle.setAttribute('aria-label',label);
  musicToggle.setAttribute('aria-pressed',String(playing));
  musicToggle.title=label;
  musicToggle.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/>${playing?'<path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>':'<path d="m16 9 5 6m0-6-5 6"/>'}</svg>`;
}
async function playBackgroundMusic(){
  try{await backgroundMusic.play()}catch{updateMusicButton()}
}
musicToggle.addEventListener('click',()=>{
  if(backgroundMusic.paused){musicPreference=true;playBackgroundMusic()}
  else{musicPreference=false;backgroundMusic.pause()}
});
// Start from an intentional gesture so mobile browsers can play the soundtrack.
document.addEventListener('click',e=>{
  if(e.target.closest('#start')&&musicPreference!==false)playBackgroundMusic();
});
backgroundMusic.addEventListener('play',updateMusicButton);
backgroundMusic.addEventListener('pause',updateMusicButton);
backgroundMusic.addEventListener('error',()=>{
  backgroundMusic.pause();updateMusicButton();
  musicToggle.title='No se pudo cargar la música. Intenta de nuevo.';
});
updateMusicButton();
