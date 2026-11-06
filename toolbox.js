/* Preserve the supplied icon pixels; remove their white matte before displaying them. */
const toolboxAlphaIcons=new Map();
function toolboxAlphaFallback(){
  if(document.getElementById('toolbox-alpha-definitions'))return;
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.id='toolbox-alpha-definitions';svg.setAttribute('width','0');svg.setAttribute('height','0');svg.setAttribute('aria-hidden','true');
  svg.style.cssText='position:absolute;pointer-events:none';
  svg.innerHTML='<defs><filter id="toolbox-white-to-alpha" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -.37778 -.37778 -.37778 0 1"/></filter></defs>';
  document.body.append(svg);
}
function transparentToolIcon(n){
  const fill=n.fills.find(f=>f.type==='IMAGE'),m=fill.imageTransform;
  const key=fill.imageHash+JSON.stringify(m);
  if(!toolboxAlphaIcons.has(key))toolboxAlphaIcons.set(key,(async()=>{
    const image=new Image();image.src=F.hashes[fill.imageHash];await image.decode();
    const canvas=document.createElement('canvas');canvas.width=Math.ceil(n.w*3);canvas.height=Math.ceil(n.h*3);
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(image,m[0][2]*image.naturalWidth,m[1][2]*image.naturalHeight,m[0][0]*image.naturalWidth,m[1][1]*image.naturalHeight,0,0,canvas.width,canvas.height);
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
    for(let i=0;i<pixels.data.length;i+=4){
      const gray=(pixels.data[i]+pixels.data[i+1]+pixels.data[i+2])/3;
      pixels.data[i+3]=Math.round(pixels.data[i+3]*Math.max(0,1-gray/225));
      pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=0;
    }
    ctx.putImageData(pixels,0,0);return canvas.toDataURL('image/png');
  })());
  return toolboxAlphaIcons.get(key);
}
function prepareToolboxIcons(host){
  toolboxAlphaFallback();
  for(const element of host.querySelectorAll('[data-id],[data-source-id]')){
    const n=byId.get(element.dataset.id||element.dataset.sourceId);
    if(n?.blendMode!=='DARKEN'||!n.fills?.some(f=>f.type==='IMAGE'))continue;
    element.dataset.toolboxIcon='true';element.style.mixBlendMode='normal';
    // The filter also covers the loading frame and local-file browsers that restrict canvas reads.
    element.style.filter='url(#toolbox-white-to-alpha)';element.dataset.iconAlpha='fallback';
    transparentToolIcon(n).then(src=>{
      if(!element.isConnected)return;
      const image=new Image();image.alt='';image.draggable=false;image.src=src;
      image.style.cssText='display:block;width:100%;height:100%;pointer-events:none';
      element.replaceChildren(image);element.style.filter='none';element.dataset.iconAlpha='ready';
    }).catch(()=>{});
  }
}
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
  prepareToolboxIcons(host);
}
function layoutToolbox(host,height){
  const scroll=host.querySelector('[data-id="570:6641"]'),fade=host.querySelector('[data-id="570:6703"]');
  if(scroll)scroll.style.height=Math.max(250,height-116)+'px';
  if(fade){yAt(fade,height-145);fade.style.height='145px';}
}
