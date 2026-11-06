/* Persistent carousel: artwork and controls are the existing Page 3 Figma layers. */
const HOME_STATES=['homeVideo','home','homeCut'];
const carouselMod=n=>((n%3)+3)%3;
function carouselEase(t){ // cubic-bezier(.22, 1, .36, 1)
  let lo=0,hi=1,u=t;
  for(let i=0;i<12;i++){u=(lo+hi)/2;const x=3*(1-u)*(1-u)*u*.22+3*(1-u)*u*u*.36+u*u*u;if(x<t)lo=u;else hi=u;}
  return 1-Math.pow(1-u,3);
}
class HomeCarousel {
  constructor(container,key,open){
    this.container=container;this.current=HOME_STATES.indexOf(key);this.position=this.current;this.actors=new Map();this.raf=0;this.open=open;this.drag=null;this.suppressUntil=0;this.duration=460;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    container.replaceChildren();container.dataset.carousel='persistent';container.style.overflow='hidden';
    this.stage=div(container,'carousel-stage',0,0,375,260);this.stage.style.overflow='hidden';this.stage.style.touchAction='pan-y';this.stage.setAttribute('role','button');this.stage.tabIndex=0;
    this.models=HOME_STATES.map((state,i)=>{const title=['Create AI video','Quick photo edit','AutoCut'][i];return flat(F.trees[ids[state]]).find(n=>Math.abs(n.w-242)<.1&&Math.abs(n.h-250)<.1&&flat(n).some(t=>t.characters===title));});
    const source=flat(F.trees[ids.home]).find(n=>n.name==='Capability position');
    this.indicator=renderNode(source,container);this.indicator.dataset.carouselIndicator='track';this.indicator.style.overflow='hidden';this.indicator.style.left='169px';this.indicator.style.top='268px';this.indicator.style.transform='none';
    const parts=[...this.indicator.children].filter(n=>n.dataset.id);this.marker=parts.at(-1);this.marker.dataset.carouselIndicator='thumb';this.marker.style.left='0px';this.marker.style.top='0px';this.marker.style.transform='none';this.marker.style.willChange='transform';this.markerTravel=source.w-byId.get(this.marker.dataset.id).w;
    this.indicator.setAttribute('role','progressbar');this.indicator.setAttribute('aria-label','能力卡片位置');this.indicator.setAttribute('aria-valuemin','1');this.indicator.setAttribute('aria-valuemax','3');
    this.ensure(this.current);this.draw(this.position,carouselMod(this.current));this.sync();
    this.stage.addEventListener('pointerdown',e=>this.down(e));this.stage.addEventListener('pointermove',e=>this.move(e));this.stage.addEventListener('pointerup',e=>this.up(e));this.stage.addEventListener('pointercancel',()=>this.cancelDrag());
    this.stage.addEventListener('click',e=>{if(performance.now()<this.suppressUntil)return;e.stopPropagation();const x=(e.clientX-this.stage.getBoundingClientRect().left)*375/this.stage.getBoundingClientRect().width;if(x<56)this.navigate(-1);else if(x>319)this.navigate(1);else this.open(HOME_STATES[carouselMod(this.current)]);});
    this.stage.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();this.navigate(e.key==='ArrowRight'?1:-1);}else if(e.key==='Enter'||e.key===' '){e.preventDefault();this.open(HOME_STATES[carouselMod(this.current)]);}});
    // Invisible keyboard/click targets reuse the existing left/right card hit regions.
    for(const [label,x,d]of [['上一张能力卡片',0,-1],['下一张能力卡片',326,1]]){const button=hit(container,x,20,49,225,()=>{if(performance.now()>=this.suppressUntil)this.navigate(d);},label);button.addEventListener('pointerdown',e=>this.down(e));button.addEventListener('pointermove',e=>this.move(e));button.addEventListener('pointerup',e=>this.up(e));button.addEventListener('pointercancel',()=>this.cancelDrag());}
    this.preload();
  }
  ensure(target){const min=Math.floor(Math.min(this.position,target))-2,max=Math.ceil(Math.max(this.position,target))+2;for(let i=min;i<=max;i++)if(!this.actors.has(i))this.createActor(i);}
  createActor(index){const type=carouselMod(index),actor=div(this.stage,'carousel-actor',66.5,5,242,250);actor.dataset.carouselCard=String(index);actor.dataset.capability=HOME_STATES[type];actor.style.transformOrigin='121px 125px';actor.style.willChange='transform,opacity';actor.style.pointerEvents='none';actor.setAttribute('aria-hidden','true');
    renderNode(this.models[type],actor,true);
    if(type===1){const root=flat(F.trees[ids.home]).find(n=>n.name==='Capability carousel / interactive');for(const item of root.children.filter(n=>['Start with a photo','Add motion','Vector 3'].includes(n.name))){const e=renderNode(item,actor);e.style.transform='none';e.style.left=(item.t[0][2]-66.5)+'px';e.style.top=(item.t[1][2]-5)+'px';}}
    this.actors.set(index,actor);return actor;
  }
  draw(position,indicatorValue){this.position=position;for(const [i,e]of this.actors){const d=i-position,a=Math.abs(d),scale=1-.14*Math.min(a,1),opacity=a<=1?1-.37*a:Math.max(0,.63*(2-a));e.style.transform=`translate3d(${d*253.4}px,${Math.min(a,1)*5.8}px,0) rotate(${Math.max(-1,Math.min(1,d))*7}deg) scale(${scale})`;e.style.opacity=opacity;e.style.zIndex=String(Math.round(30-a*10));}
    this.marker.style.transform=`translate3d(${Math.max(0,Math.min(2,indicatorValue))*this.markerTravel/2}px,0,0)`;
  }
  sync(){const key=HOME_STATES[carouselMod(this.current)];S.page=key;S.home=key;phone.dataset.page=key;document.querySelector('#screen-select').value=key;document.title='CapCut AI Lab · '+names[key];this.stage.setAttribute('aria-label','打开'+names[key]);this.indicator.setAttribute('aria-valuenow',String(carouselMod(this.current)+1));}
  markerValue(){const m=new DOMMatrixReadOnly(getComputedStyle(this.marker).transform);return m.m41*2/this.markerTravel;}
  stop(){cancelAnimationFrame(this.raf);this.raf=0;}
  animateTo(target){this.stop();this.ensure(target);const from=this.position,markerFrom=this.markerValue(),markerTo=carouselMod(target);this.current=target;this.sync();
    if(this.reduced||Math.abs(target-from)<.0001){this.draw(target,markerTo);this.prune();return;}
    const started=performance.now(),duration=this.duration*Math.max(.6,Math.min(1.15,Math.abs(target-from)));
    const tick=now=>{if(!this.container.isConnected)return;const t=Math.min(1,(now-started)/duration),k=carouselEase(t);this.draw(from+(target-from)*k,markerFrom+(markerTo-markerFrom)*k);if(t<1)this.raf=requestAnimationFrame(tick);else{this.raf=0;this.draw(target,markerTo);this.prune();}};this.raf=requestAnimationFrame(tick);
  }
  prune(){for(const [i,e]of this.actors)if(Math.abs(i-this.current)>2){e.remove();this.actors.delete(i);}}
  navigate(delta){this.suppressUntil=performance.now()+60;this.animateTo(this.current+delta);}
  down(e){if(e.pointerType==='mouse'&&e.button!==0)return;this.stop();this.drag={id:e.pointerId,x:e.clientX,y:e.clientY,base:this.position,marker:this.markerValue(),index:Math.round(this.position),lastX:e.clientX,lastTime:performance.now(),velocity:0,dx:0,moved:false};e.currentTarget.setPointerCapture(e.pointerId);}
  move(e){const d=this.drag;if(!d||e.pointerId!==d.id)return;const rect=this.stage.getBoundingClientRect(),scale=rect.width/375,dx=(e.clientX-d.x)/scale,dy=(e.clientY-d.y)/scale;if(!d.moved&&Math.abs(dy)>Math.abs(dx)+10)return;if(Math.abs(dx)>5)d.moved=true;if(!d.moved)return;e.preventDefault();const now=performance.now(),dt=now-d.lastTime;d.velocity=dt>0?(e.clientX-d.lastX)/scale/dt:d.velocity;d.lastTime=now;d.lastX=e.clientX;d.dx=dx;const amount=Math.max(-1.15,Math.min(1.15,-dx/253.4)),position=d.base+amount;this.ensure(position);const markerTo=carouselMod(d.index+(amount<0?-1:1));this.draw(position,d.marker+(markerTo-d.marker)*Math.min(1,Math.abs(amount)));}
  up(e){const d=this.drag;if(!d||d.id!==e.pointerId)return;this.drag=null;if(d.moved){this.suppressUntil=performance.now()+350;e.preventDefault();e.stopPropagation();const velocity=performance.now()-d.lastTime<120?d.velocity:0;const direction=d.dx<0?1:-1;const commit=Math.abs(d.dx)>35||Math.abs(velocity)>.35;this.animateTo(commit?d.index+direction:d.index);}else if(Math.abs(this.position-this.current)>.001)this.animateTo(this.current);}
  cancelDrag(){if(!this.drag)return;this.drag=null;this.suppressUntil=performance.now()+200;this.animateTo(this.current);}
  preload(){for(const actor of this.actors.values())for(const im of actor.querySelectorAll('img'))im.decode?.().catch(()=>{});}
}
function installHomeCarousel(key,host){const viewport=named('Workspace scroll viewport')[0];if(viewport){viewport.style.overflowY='hidden';viewport.style.overflowX='hidden';viewport.scrollTop=0;}
  const container=named('Capability carousel / interactive')[0];const open=state=>{if(state==='homeVideo')go('videoActions');else if(state==='homeCut'){S.pickerFrom='photoPicker';go('photoPicker');}else go('imageActions');};
  window.homeCarousel=new HomeCarousel(container,key,open);return window.homeCarousel;
}
