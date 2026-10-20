// Preserve the complete layout while revealing each character in reading order.
function typewrite(elements){
  let character=0;
  for(const el of elements){
    el.setAttribute('aria-label',el.innerText);
    const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    for(const node of nodes){
      const fragment=document.createDocumentFragment();
      for(const letter of Array.from(node.textContent)){
        const span=document.createElement('span');
        span.className='type-character';span.textContent=letter;
        span.setAttribute('aria-hidden','true');
        span.style.setProperty('--type-delay',`${character++*46}ms`);
        fragment.append(span);
      }
      node.replaceWith(fragment);
    }
    el.classList.add('typewriting');
    character+=6;
  }
}

async function enterMemories(){
  const token=epoch;
  if(matchMedia('(pointer:coarse)').matches)enableSensor();
  const overlay=document.createElement('div');overlay.className='bubble-transition';
  overlay.setAttribute('aria-hidden','true');
  for(let i=0;i<42;i++){
    const bubble=document.createElement('span');bubble.className='transition-bubble';
    const size=50+(i*47%145);
    bubble.style.cssText=`--bubble-size:${size}px;--bubble-left:${i*37%112-6}%;--bubble-delay:${i%10*80}ms;--bubble-duration:${2400+i%5*160}ms;--bubble-drift:${i%2===0?1:-1}%;`;
    overlay.append(bubble);
  }
  document.getElementById('app').append(overlay);
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  screen.querySelector('.intro')?.classList.add('intro-departing');
  try{
    await new Promise(resolve=>setTimeout(resolve,1100));
    if(page===1&&epoch===token)await go(2,false);
    await new Promise(resolve=>setTimeout(resolve,2800));
  }finally{overlay.remove()}
}
