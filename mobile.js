/* All screens reuse the user's light 9:41 status-bar asset. No new icons. */
const mobileBaseGeometry=new WeakMap();
let demoViewport={height:812,scale:1,mobile:false};
function commonStatusBar(host){
  host.querySelectorAll('[data-name="iPhone X (or newer)"]').forEach(e=>e.remove());
  host.querySelectorAll('.unified-status').forEach(e=>e.remove());
  const bar=div(host,'unified-status',0,0,375,44);bar.dataset.statusStyle='light-941';bar.setAttribute('aria-label','9:41，信号、Wi-Fi 和电量');
  bar.style.zIndex='180';bar.style.pointerEvents='none';bar.style.background='transparent';
  const im=document.createElement('img');im.src=F.svgs['153:5214'];im.alt='';im.draggable=false;im.width=375;im.height=44;bar.append(im);
}
function geometry(el){if(!mobileBaseGeometry.has(el)){mobileBaseGeometry.set(el,{x:parseFloat(el.style.left)||0,y:parseFloat(el.style.top)||0,w:parseFloat(el.style.width)||0,h:parseFloat(el.style.height)||0});}return mobileBaseGeometry.get(el);}
function yAt(el,y){geometry(el);el.style.top=y+'px';}
function moveBottomChildren(parent,delta,minY=600){for(const e of parent.children){const b=geometry(e);if(b.y>=minY)yAt(e,b.y+delta);}}
function rootNode(host){const id=HOME_STATES.includes(S.page)?ids.home:ids[S.page];if(!id)return null;return [...host.children].find(e=>e.dataset.id===id);}
function resizeMobilePage(){
  const host=phone.querySelector('.screen');if(!host)return;const H=demoViewport.height,delta=H-812;host.style.height=H+'px';
  const root=rootNode(host);if(root){root.style.height=H+'px';for(const e of root.children)if(e.classList.contains('paint'))e.style.height=H+'px';}
  if(HOME_STATES.includes(S.page)||S.page==='mode'){
    if(root)moveBottomChildren(root,delta);moveBottomChildren(host,delta);
    const viewport=named('Workspace scroll viewport')[0],content=named('Workspace content')[0],carousel=named('Capability carousel / interactive')[0]||named('Capability carousel / swipe')[0];
    const titleY=159-Math.min(50,Math.max(0,-delta)*.22),carouselY=titleY+105;
    if(content)yAt(content,titleY-111);
    if(viewport){viewport.style.height=Math.max(350,H-111-154)+'px';viewport.style.overflow='hidden';}
    if(carousel){const factor=Math.min(1,Math.max(.68,(620.72+delta-14-carouselY)/276));carousel.style.transformOrigin='187.5px 0';carousel.style.transform=`scale(${factor})`;}
  }else if(['form','uploaded','videoForm'].includes(S.page)){
    const panel=named('Bottom sheet / Light')[0];if(panel){const top=Math.max(48,H-514),height=H-top;yAt(panel,top);panel.style.height=height+'px';const footer=named('Fixed action area')[0],body=named('Form content')[0];if(footer)yAt(footer,height-100);if(body){body.style.maxHeight=Math.max(100,height-128)+'px';body.style.overflowY='auto';body.style.scrollbarWidth='none';}}
  }else if(S.page==='tools'){
    moveBottomChildren(root,delta);const scroll=named('Scrollable AI tool catalogue')[0];if(scroll)scroll.style.height=Math.max(250,H-130)+'px';
  }else if(S.page==='explore'){
    moveBottomChildren(root,delta);moveBottomChildren(host,delta);const scroll=host.querySelector('.explore-scroll');if(scroll)scroll.style.height=Math.max(160,H-141)+'px';
  }else if(['videoActions','imageActions'].includes(S.page)){
    let region=host.querySelector('.mobile-actions-scroll');if(!region){region=div(host,'mobile-actions-scroll',0,144,375,Math.max(160,H-291));region.style.overflowY='auto';region.style.scrollbarWidth='none';for(const e of [...host.children]){if(e===region)continue;const b=geometry(e);if(b.y>=144&&b.y<673){region.append(e);yAt(e,b.y-144);}}const pad=div(region,'',0,526,1,1);pad.style.pointerEvents='none';}
    region.style.height=Math.max(150,H-291)+'px';for(const e of host.children){if(e===region)continue;const b=geometry(e);if(b.y>=673)yAt(e,b.y+delta);}
  }else if(['photoPicker','picker'].includes(S.page)){
    const footerY=H-(S.page==='picker'?163:88);for(const e of host.children){const b=geometry(e);if(b.y>=(S.page==='picker'?649:724))yAt(e,b.y+delta);if(b.y===578)yAt(e,b.y+delta);}
    const gallery=host.querySelector('.gallery-area');if(gallery)gallery.style.height=Math.max(130,footerY-114)+'px';
  }else if(['photoPrompt','add','keyboard'].includes(S.page)){moveBottomChildren(host,delta,200);
  }else if(S.page==='case'){moveBottomChildren(host,delta,476);
  }else if(['uploading','assistant'].includes(S.page)){if(root)moveBottomChildren(root,delta);moveBottomChildren(host,delta);}
}
function fitDemoViewport(){
  const mobile=innerWidth<=600,visual=window.visualViewport;let safeTop=0,safeBottom=0;
  const probe=document.querySelector('#safe-probe');if(mobile&&probe){const cs=getComputedStyle(probe);safeTop=parseFloat(cs.paddingTop)||0;safeBottom=parseFloat(cs.paddingBottom)||0;}
  const width=mobile?Math.min(innerWidth,visual?.width||innerWidth):innerWidth,height=mobile?(visual?.height||innerHeight):innerHeight;
  const scale=mobile?width/375:Math.min((width-72)/375,(height-70)/812,1),canvasH=mobile?Math.max(400,(height-safeTop-safeBottom)/scale):812;
  demoViewport={mobile,height:canvasH,scale};const fit=document.querySelector('#fit');fit.style.width=375*scale+'px';fit.style.height=canvasH*scale+'px';phone.style.height=canvasH+'px';phone.style.transform=`scale(${scale})`;
  if(mobile){fit.style.left='0';fit.style.top=safeTop+'px';fit.style.transform='none';}else{fit.style.left='50%';fit.style.top='50%';fit.style.transform='translate(-50%,-50%)';}
  resizeMobilePage();
}
window.visualViewport?.addEventListener('resize',()=>requestAnimationFrame(fitDemoViewport));
window.addEventListener('orientationchange',()=>requestAnimationFrame(fitDemoViewport));
