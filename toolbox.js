/* Keep the supplied tool layers and their DARKEN blend; paginate the existing 4 × 2 grid. */
function buildToolbox(host){
  host.classList.add('toolbox-screen');host.style.touchAction='pan-x pan-y';
  const quick=node('583:7145'),row1=node('583:7146'),row2=node('583:7251');
  const indicator=node('583:7189'),thumb=node('583:7191');
  const pager=div(quick,'quick-tools-pager',0,0,375,184);
  pager.tabIndex=0;pager.setAttribute('role','region');pager.setAttribute('aria-label','快速 AI 工具，左右滑动切换');
  const page1=div(pager,'quick-tools-page',0,0,375,184);page1.setAttribute('aria-label','快速 AI 工具第 1 页');
  page1.append(row1,row2);
  const page2=div(pager,'quick-tools-page',375,0,375,184);page2.setAttribute('aria-label','快速 AI 工具第 2 页');
  const tiles=[...page1.querySelectorAll('.text-node')].map(text=>text.parentElement);
  const order=[2,3,0,1,6,7,4,5];
  order.forEach((index,i)=>{
    const tile=tiles[index].cloneNode(true);
    for(const el of [tile,...tile.querySelectorAll('[data-id]')]){if(el.dataset.id){el.dataset.sourceId=el.dataset.id;delete el.dataset.id;}}
    tile.style.left=(i%4*93.75)+'px';tile.style.top=(Math.floor(i/4)*92)+'px';page2.append(tile);
  });
  const indicatorTravel=byId.get('583:7190').w-byId.get('583:7191').w;
  const sync=()=>{
    const progress=Math.max(0,Math.min(1,pager.scrollLeft/375));
    thumb.style.transform=`translateX(${progress*indicatorTravel}px)`;
    S.toolsPage=Math.round(progress);pager.dataset.activePage=String(S.toolsPage);
  };
  pager.addEventListener('scroll',sync,{passive:true});
  function select(index){pager.scrollTo({left:Math.max(0,Math.min(1,index))*375,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  pager.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();select((S.toolsPage||0)+(e.key==='ArrowRight'?1:-1));}});
  click(indicator,()=>select(S.toolsPage?0:1),'切换快速 AI 工具页');
  pager.scrollLeft=(S.toolsPage||0)*375;sync();
  const fade=node('570:6703');fade.replaceChildren();fade.style.pointerEvents='none';
  fade.style.background='linear-gradient(180deg,rgba(241,244,249,0) 0%,#f1f4f9 60%,#f1f4f9 100%)';
}
function layoutToolbox(host,height){
  const scroll=host.querySelector('[data-id="570:6641"]'),fade=host.querySelector('[data-id="570:6703"]');
  if(scroll)scroll.style.height=Math.max(250,height-116)+'px';
  if(fade){yAt(fade,height-145);fade.style.height='145px';}
}
