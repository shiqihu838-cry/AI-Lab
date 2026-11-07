/* The output selector is an overlay on the current screen, never a replacement page. */
let modeMenuState=null;
function layoutModeMenu(){
  if(!modeMenuState)return;
  const {layer,menu,anchor}=modeMenuState,H=demoViewport.height;
  layer.style.height=H+'px';layer.querySelector('.hotspot').style.height=H+'px';
  let left=63,top=H-283;
  if(anchor?.isConnected){
    const r=anchor.getBoundingClientRect(),p=phone.getBoundingClientRect();
    left=(r.left-p.left)/demoViewport.scale+3;
    top=(r.top-p.top)/demoViewport.scale-145;
  }
  menu.style.left=Math.max(12,Math.min(194,left))+'px';
  menu.style.top=Math.max(48,Math.min(H-153,top))+'px';
}
function resizeModeBackground(){
  if(!modeMenuState)return;
  const page=S.page;S.page=modeMenuState.origin;
  try{resizeMobilePage();}finally{S.page=page;}
  layoutModeMenu();
}
function closeModeMenu(){
  if(!modeMenuState)return;
  const state=modeMenuState;modeMenuState=null;state.layer.remove();
  S.page=state.origin;S.previous=state.previous;
  phone.dataset.page=S.page;document.querySelector('#screen-select').value=S.page;
  document.title=state.title;
}
function openModeMenu(){
  if(modeMenuState)return;
  if(!phone.querySelector('.screen'))go('home',false);
  const host=phone.querySelector('.screen'),origin=S.page;
  if(HOME_STATES.includes(origin))window.homeCarousel?.stop();
  const anchor=host.querySelector('[aria-label="选择创作模式"],[aria-label="选择模式"],[aria-label="模式"]');
  const layer=div(host,'mode-layer',0,0,375,demoViewport.height);layer.style.zIndex=160;
  hit(layer,0,0,375,demoViewport.height,closeModeMenu,'关闭模式选择');
  const menu=renderNode(byId.get('558:5988'),layer);menu.style.zIndex=90;
  menu.setAttribute('role','dialog');menu.setAttribute('aria-label','输出类型');menu.setAttribute('aria-modal','true');
  modeMenuState={layer,menu,anchor,origin,previous:S.previous,title:document.title};
  S.page='mode';phone.dataset.page='mode';document.querySelector('#screen-select').value='mode';
  document.title='CapCut AI Lab · Auto / Video / Image';
  for(const text of menu.querySelectorAll('.text-node')){
    const value=text.textContent;if(!['Auto','Video','Image'].includes(value))continue;
    click(text.parentElement.parentElement,()=>{
      if(value==='Auto'){if(HOME_STATES.includes(origin))closeModeMenu();else go(S.home);}
      else go(value==='Video'?'videoActions':'imageActions');
    },value);
  }
  layoutModeMenu();
}
