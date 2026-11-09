/* Page 3 source-of-truth: dimensions, paints, crops and SVGs are exported from the user's file. */
const F=window.FIGMA,phone=document.querySelector('#phone');
const ids={home:'153:5127',homeCut:'620:8445',homeVideo:'677:3666',explore:'153:5014',tools:'570:6640',form:'632:1779',uploaded:'663:3156',videoForm:'676:3216',uploading:'677:4099',assistant:'679:5798',mode:'558:5860'};
const names={home:'AI Lab · 快速修图',homeVideo:'AI Lab · AI 视频',homeCut:'AI Lab · AutoCut',explore:'AI Trends',tools:'AI Toolbox',history:'History',photoPicker:'AutoCut · 选择素材',photoPrompt:'AutoCut · 上传与提示词',videoActions:'AI 视频 · Quick actions',imageActions:'AI 修图 · Quick actions',case:'同款视频',aiVideoFeed:'AI video · 视频流',form:'同款 · 上传前',picker:'选择图片',uploaded:'同款 · 上传后',uploading:'Uploading',assistant:'AI 回复',keyboard:'输入框',mode:'Auto / Video / Image',add:'添加素材',videoForm:'AI 视频 · 上传前'};
const S={page:'home',history:[],home:'home',previous:'home',photo:null,selected:0,selectedCell:0,pickerFrom:'form',prompt:'',duration:0,quality:0,tab:0,category:1,task:false,editing:false};let timer,swipeBusy=false;
const flat=n=>[n,...(n.children??[]).flatMap(flat)];const allNodes=Object.values(F.trees).flatMap(flat);const byId=new Map(allNodes.map(n=>[n.id,n]));
const color=(c,a=1)=>`rgba(${Math.round(c.r*255)},${Math.round(c.g*255)},${Math.round(c.b*255)},${c.a??a})`;
function setBox(el,x,y,w,h){Object.assign(el.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px'});return el;}
function div(parent,cls,x,y,w,h){const e=document.createElement('div');e.className=cls;e.style.position='absolute';setBox(e,x,y,w,h);parent.append(e);return e;}
function grad(f){const m=f.gradientTransform??[[0,1,0],[-1,0,1]];const a=m[0][0],b=m[0][1];const deg=Math.atan2(a,-b)*180/Math.PI;return `linear-gradient(${deg}deg,${f.gradientStops.map(s=>`${color(s.color)} ${s.position*100}%`).join(',')})`;}
function imagePaint(el,n,f){const layer=div(el,'paint',0,0,n.w,n.h),im=document.createElement('img');im.src=F.hashes[f.imageHash];im.alt='';im.draggable=false;layer.append(im);if(f.opacity!==undefined)layer.style.opacity=f.opacity;
 if(f.scaleMode==='CROP'&&f.imageTransform){const m=f.imageTransform,sx=m[0][0],sy=m[1][1];if(Math.abs(m[0][1])<.0001&&Math.abs(m[1][0])<.0001&&sx&&sy){setBox(im,-m[0][2]*n.w/sx,-m[1][2]*n.h/sy,n.w/sx,n.h/sy);return;}}
 Object.assign(im.style,{left:0,top:0,width:'100%',height:'100%',objectFit:f.scaleMode==='FIT'?'contain':'cover'});
}
function renderNode(n,parent,root=false){if(n.isMask)return null;const e=document.createElement('div');e.className='figma-node'+(n.type==='TEXT'?' text-node':'');e.dataset.id=n.id;e.dataset.name=n.name;parent.append(e);e.style.width=n.w+'px';e.style.height=n.h+'px';if(!root){const m=n.t;if(Math.abs(m[0][0]-1)<.00001&&Math.abs(m[1][1]-1)<.00001&&Math.abs(m[0][1])<.00001&&Math.abs(m[1][0])<.00001){e.style.left=m[0][2]+"px";e.style.top=m[1][2]+"px";}else e.style.transform=`matrix(${m[0][0]},${m[1][0]},${m[0][1]},${m[1][1]},${m[0][2]},${m[1][2]})`;}
 if(n.opacity!==undefined)e.style.opacity=n.opacity;if(n.blendMode==='DARKEN')e.style.mixBlendMode='darken';
 if(n.type==='ELLIPSE')e.style.borderRadius='50%';else e.style.borderRadius=(n.topLeftRadius??n.cornerRadius??0)+'px '+(n.topRightRadius??n.cornerRadius??0)+'px '+(n.bottomRightRadius??n.cornerRadius??0)+'px '+(n.bottomLeftRadius??n.cornerRadius??0)+'px';
 if(n.clipsContent||n.children?.some(c=>c.isMask))e.style.overflow='hidden';const mask=n.children?.find(c=>c.isMask);if(mask?.cornerRadius)e.style.borderRadius=mask.cornerRadius+'px';if(n.overflowDirection==='VERTICAL'){e.style.overflowY='auto';e.style.scrollbarWidth='none';e.style.overscrollBehavior='contain';}
 if(Object.hasOwn(F.svgs,n.id)){if(F.svgs[n.id]){const im=document.createElement('img');im.className='figma-svg';im.src=F.svgs[n.id];im.alt='';im.draggable=false;e.append(im);}return e;}
 if(n.type==='TEXT'){const f=n.fontName?.family??'SF Pro';e.style.fontFamily=f==='Noto Sans SC'?'"Noto Sans SC","PingFang SC",sans-serif':'"SF Pro",Arial,sans-serif';e.style.fontSize=(n.fontSize??14)+'px';const weights={Regular:400,Medium:500,Semibold:600,Bold:700,Heavy:850,Black:900};e.style.fontWeight=n.fontName?.variationSettings?.wght??weights[n.fontName?.style]??400;const lh=n.lineHeight;e.style.lineHeight=lh?.unit==='PIXELS'?lh.value+'px':lh?.unit==='PERCENT'?lh.value/100:'normal';if(n.letterSpacing?.value)e.style.letterSpacing=(n.letterSpacing.unit==='PERCENT'?n.letterSpacing.value*(n.fontSize??14)/100:n.letterSpacing.value)+'px';e.style.textAlign=(n.textAlignHorizontal??'LEFT').toLowerCase();if(n.textAutoResize==='WIDTH_AND_HEIGHT'||n.characters?.includes('\n')||n.h<(n.fontSize??14)*2)e.style.whiteSpace='pre';const p=n.fills?.find(f=>f.type==='SOLID');e.style.color=p?color(p.color,p.opacity):'#0b0d14';e.textContent=n.characters??'';applyDesignLetterform(e,n.id);if(n.characters==='Try It')e.classList.add('cta-optical-label');return e;}
 for(const f of [...(n.fills??[])].reverse()){if(f.type==='SOLID'){const layer=div(e,'paint',0,0,n.w,n.h);layer.style.background=color(f.color,f.opacity);}else if(f.type==='IMAGE')imagePaint(e,n,f);else if(f.type==='GRADIENT_LINEAR'){const layer=div(e,'paint',0,0,n.w,n.h);layer.style.background=grad(f);}}
 const stroke=n.strokes?.find(f=>f.type==='SOLID');if(stroke){const s=n.strokeWeight??1;e.style.boxShadow=`inset 0 0 0 ${s}px ${color(stroke.color,stroke.opacity)}`;}
 const shadows=(n.effects??[]).filter(f=>f.visible!==false&&f.type==='DROP_SHADOW').map(f=>`${f.offset.x}px ${f.offset.y}px ${f.radius}px ${f.spread??0}px ${color(f.color)}`);if(shadows.length){if(n.type==='GROUP')e.style.filter=(n.effects??[]).filter(f=>f.visible!==false&&f.type==='DROP_SHADOW').map(f=>`drop-shadow(${f.offset.x}px ${f.offset.y}px ${f.radius/2}px ${color(f.color)})`).join(' ');else e.style.boxShadow=[e.style.boxShadow,...shadows].filter(Boolean).join(',');}
 for(const c of n.children??[])renderNode(c,e);if(n.id==='153:5247'){const content=div(e,'badge-optical-content',0,0,n.w,n.h);for(const child of [...e.children])if(child!==content&&child.dataset.id)content.append(child);}return e;
}
function nativeTree(key){const host=div(phone,'screen',0,0,375,812);const tree=HOME_STATES.includes(key)?F.trees[ids.home]:F.trees[ids[key]];renderNode(tree,host,true);return host;}
function node(id){return phone.querySelector(`[data-id="${CSS.escape(id)}"]`);}function named(name){return [...phone.querySelectorAll('[data-name]')].filter(e=>e.dataset.name===name);}
function click(el,fn,label){if(!el)return;el.style.cursor='pointer';el.setAttribute('role','button');el.tabIndex=0;if(label)el.setAttribute('aria-label',label);el.addEventListener('click',ev=>{ev.stopPropagation();fn(ev);});el.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();fn(ev);}});}
function hit(parent,x,y,w,h,fn,label){const b=document.createElement('button');b.className='hotspot';b.setAttribute('aria-label',label);setBox(b,x,y,w,h);b.onclick=fn;parent.append(b);return b;}
function label(parent,s,x,y,w,h,size=14,weight=400,c='#0b0d14'){const e=div(parent,'native-label',x,y,w,h);e.textContent=s;Object.assign(e.style,{fontSize:size+'px',fontWeight:weight,lineHeight:(size+5)+'px',color:c});return e;}
function crop(parent,src,x,y,w,h,sx,sy,sw,sh,r=0){const e=div(parent,'crop',x,y,w,h);e.style.borderRadius=r+'px';const im=document.createElement('img');im.src=src;im.alt='';im.draggable=false;setBox(im,-sx*w/sw,-sy*h/sh,375*w/sw,812*h/sh);e.append(im);return e;}
function icon(parent,name,x,y,size=20){const n=allNodes.find(n=>n.name===name&&F.svgs[n.id]);if(!n)return null;const box=div(parent,'',x,y,size,size);box.style.position='absolute';const im=document.createElement('img');im.src=F.svgs[n.id];im.alt='';im.style.transformOrigin='0 0';im.style.transform=`scale(${size/n.w})`;box.append(im);return box;}
function removeNode(id){node(id)?.remove();}function go(key,push=true){if(key==='mode'){openModeMenu();return;}if(modeMenuState)closeModeMenu();clearTimeout(timer);if(push&&key!==S.page)S.history.push(S.page);S.previous=S.page;S.page=key;render();}function back(){if(modeMenuState){closeModeMenu();return;}go(S.history.pop()||S.home,false);}function picker(from){S.pickerFrom=from;S.selected=0;go(from==='photoPicker'?'photoPicker':'picker');}
function editable(parent,x,y,w,h,value,placeholder,onChange){const t=document.createElement('textarea');t.className='editable';setBox(t,x,y,w,h);t.value=value;t.placeholder=placeholder;t.style.fontSize='14px';t.setAttribute('aria-label',placeholder);if(S.page==='keyboard')t.inputMode='none';t.addEventListener('input',()=>onChange(t.value));parent.append(t);return t;}
function bindInput(host,y=665){hit(host,96,y,210,52,()=>go('keyboard'),'输入创作想法');hit(host,21,y+9,36,35,()=>go('add'),'添加素材');hit(host,60,y+9,35,35,()=>go('mode'),'选择创作模式');}
function bindHome(key,host){S.home=key;installHomeCarousel(key,host);hit(host,15,62,105,34,()=>go('explore'),'AI Trends');hit(host,328,621,32,32,()=>go('tools'),'AI Toolbox');bindInput(host);hit(host,15,620,145,34,()=>go('imageActions'),'Auto enhance');hit(host,163,620,145,34,()=>go('videoActions'),'Auto captions');hit(host,327,62,33,34,()=>go('history'),'创作历史');}
function switchHome(delta){window.homeCarousel?.navigate(delta);}
function bindForm(key,host){applyMakeItYoursStyle(host);named('Close').forEach(e=>click(e,back,'关闭'));const upload=named(key==='uploaded'?'Uploaded photo / Light':'Upload photo')[0];click(upload,()=>picker(key),'选择或更换照片');named('Dialogue field').forEach(e=>{const t=e.querySelector('.text-node');if(t)t.style.visibility='hidden';const input=editable(e,12,11,311,28,S.prompt,'I came for the snacks, I stayed for the beat',v=>S.prompt=v);input.style.fontSize='11px';input.style.color='#75868e';input.style.lineHeight='16px';});
 for(const [setting,labels,field] of [['时长',['标准','超长'],'duration'],['清晰度',['标清','高清'],'quality']]){const row=named(setting+' segmented control')[0];if(!row)continue;const children=[...row.children].filter(c=>c.dataset.id);children.forEach((e,i)=>{if(i>1)return;const selected=S[field]===i;const paints=e.querySelector('.paint');if(paints)paints.style.background=selected?'#55dce2':'transparent';else if(selected)e.style.background='#55dce2';const text=e.querySelector('.text-node');if(text)text.style.color=selected?'#152b32':'#9caab5';click(e,()=>{S[field]=i;render();},labels[i]);});}
 if(key==='uploaded'&&S.photo){const pic=named('Uploaded portrait / Original crop')[0];if(pic){pic.replaceChildren();if(typeof S.photo==='object')crop(pic,S.photo.src,0,0,byId.get(pic.dataset.id).w,byId.get(pic.dataset.id).h,...S.photo.rect,12);else{const im=document.createElement('img');im.src=S.photo;im.alt='已选图片';Object.assign(im.style,{width:'100%',height:'100%',objectFit:'cover',borderRadius:'12px'});pic.append(im);}}}
 
 if(key==='uploaded'){const button=named('Generate / Awaiting photo')[0];if(button)click(button,()=>{S.task=true;go('uploading');},'Generate');}
}
let sharedAIVideo=null;
function aiVideoPlayback(className){
  if(!sharedAIVideo){
    sharedAIVideo=document.createElement('video');sharedAIVideo.muted=true;sharedAIVideo.defaultMuted=true;sharedAIVideo.loop=true;sharedAIVideo.playsInline=true;sharedAIVideo.autoplay=true;
    for(const attr of ['muted','playsinline','webkit-playsinline'])sharedAIVideo.setAttribute(attr,'');
    sharedAIVideo.src=window.DEMO_ASSETS?.['assets/source-ai-video.mp4']||'assets/source-ai-video.mp4';sharedAIVideo.dataset.sharedAiVideo='true';
  }
  sharedAIVideo.className=className;return sharedAIVideo;
}
function applyMakeItYoursStyle(host){
  host.classList.add('make-it-yours-screen');
  const root=rootNode(host),sheet=named('Bottom sheet / Light')[0];
  for(const id of ['632:1780','663:3157','676:3274'])removeNode(id);
  named('Dimmed video backdrop').forEach(e=>e.remove());
  if(root&&sheet){
    const preview=div(root,'make-it-yours-preview',0,44,375,282),video=aiVideoPlayback('make-it-yours-video');
    preview.append(video);root.insertBefore(preview,sheet);video.play().catch(()=>{});
  }
  named('Create your own').forEach(e=>{e.style.width='240px';e.textContent='Make it yours';e.setAttribute('aria-label','Make it yours');applyDesignLetterform(e,'form:make-it-yours-heading');});
  named('Upload photo').forEach(e=>{e.style.border='0';e.style.boxShadow='none';});
}
function bindTools(host){buildToolbox(host);named('Close').forEach(e=>click(e,back,'关闭工具箱'));const titles=['AutoCut','Photo tools','AI generator','Auto captions','Ai clipper','AI photo editor','Auto enhance','Generate media','AI video','AI photo edit','AI story','AI avatar'];for(const text of host.querySelectorAll('.text-node')){const title=text.textContent;if(!titles.includes(title))continue;click(text.parentElement,()=>{if(title==='AutoCut'){S.pickerFrom='photoPicker';go('photoPicker');}else if(['AI video','AI generator','Generate media','Auto captions','Ai clipper'].includes(title))go('videoActions');else go('imageActions');},title);}}
function bindExplore(host){buildExplore(host);}
function bindAssistant(host){named('history button').forEach(e=>click(e,()=>go('history'),'创作历史'));named('back button').forEach(e=>click(e,back,'返回'));bindInput(host,673);if(S.page==='uploading'){timer=setTimeout(()=>go('assistant'),2400);const stop=named('Composer / uploading')[0];if(stop)hit(stop,302,57,36,36,()=>go('assistant'),'停止');}else renderAssistantBody(host);}
function render(){const keepPlayback=['form','uploaded','videoForm'].includes(S.page)||(S.page==='aiVideoFeed'&&S.aiFeedIndex!==1);if(keepPlayback)sharedAIVideo?.remove();for(const video of phone.querySelectorAll('video'))video.pause();if(!keepPlayback)sharedAIVideo?.pause();window.homeCarousel?.destroy();phone.replaceChildren();document.querySelector('#screen-select').value=S.page;let host;
 if(ids[S.page]){host=nativeTree(S.page);if(['home','homeVideo','homeCut'].includes(S.page))bindHome(S.page,host);else if(['form','uploaded','videoForm'].includes(S.page))bindForm(S.page,host);else if(S.page==='tools')bindTools(host);else if(S.page==='explore')bindExplore(host);else if(['uploading','assistant'].includes(S.page))bindAssistant(host);else if(S.page==='mode')bindMode(host);}else{host=div(phone,'screen',0,0,375,812);renderSpecial(S.page,host);}document.title='CapCut AI Lab · '+(names[S.page]||S.page);phone.dataset.page=S.page;window.demoState=S;commonStatusBar(host);fitDemoViewport();}
function fit(){fitDemoViewport();}
document.querySelector('#screen-select').innerHTML=Object.entries(names).map(([key,name])=>`<option value="${key}">${name}</option>`).join('');document.querySelector('#screen-select').onchange=e=>go(e.target.value);document.querySelector('#restart').onclick=()=>{S.history=[];S.prompt='';S.photo=null;go('home',false);};window.addEventListener('resize',fit);window.addEventListener('keydown',e=>{if(e.key==='Escape')back();});

const source=k=>window.DEMO_ASSETS?.['assets/source-'+k+'.png']||'assets/source-'+k+'.png';
function status(){/* Shared light status bar is mounted after page composition. */}
function sourceIcon(host,key,rect,x,y,w=rect[2],h=rect[3]){return crop(host,source(key),x,y,w,h,...rect);}
function composer(host,{y=673,mode='Auto',key='video-prompt',value='',placeholder='Tell me your idea',wide=false}={}){const box=div(host,'native-panel',15,y,345,101);box.style.background='#f8fbff';const edit=editable(box,15,15,315,36,value,placeholder,v=>S.prompt=v);edit.style.color='#0b0d14';
 const plus=icon(box,'icon/plus',18,67,16);const p=div(box,'',11,60,30,30);p.style.border='1px solid #e4e9ec';p.style.borderRadius='50%';click(p,()=>go('add'),'添加素材');
 if(mode==='Auto'){icon(box,'icon/auto',51,67,16);hit(box,47,60,30,30,()=>go('mode'),'选择模式');}else{const pill=div(box,'',49,60,72,30);pill.style.border='1px solid #e4e9ec';pill.style.borderRadius='16px';sourceIcon(pill,key,[74,738,16,16],10,7,16,16);label(pill,mode,29,7,41,20,12);click(pill,()=>go('mode'),'选择模式');if(mode==='Video'){const model=div(box,'',128,60,107,30);model.style.border='1px solid #e4e9ec';model.style.borderRadius='16px';sourceIcon(model,key,[150,737,17,17],8,7,17,17);label(model,'Seedance 2.5',29,7,77,20,11);click(model,()=>go('videoActions'),'Seedance 2.5');}else{sourceIcon(box,key,[144,732,32,32],128,59,32,32);}}
 sourceIcon(box,key,[280,731,34,34],265,58,34,34);sourceIcon(box,key,[317,731,34,34],302,58,34,34);hit(box,301,57,36,36,()=>{if(S.prompt.trim()){S.task=true;go('uploading');}else go('explore');},'发送');return box;}
function bindMode(host){for(const e of [...phone.querySelectorAll('.text-node')]){if(e.textContent==='Auto')click(e.parentElement,()=>go(S.home),'Auto');if(e.textContent==='Video')click(e.parentElement,()=>go('videoActions'),'Video');if(e.textContent==='Image')click(e.parentElement,()=>go('imageActions'),'Image');}hit(host,0,0,375,520,back,'关闭模式选择');}
function selector(host,key,top=58){
  const head=div(host,'',0,top,375,56);
  head.style.background='#fff';
  head.style.borderRadius='16px 16px 0 0';
  const handle=div(head,'',170,5,34,4);
  handle.style.background='#f1f1f1';
  handle.style.borderRadius='2px';
  label(head,'Select media',15,27,170,22,13,500);
  label(head,key==='picker'?'Photos':'All',key==='picker'?211:239,27,47,22,13);
  const chevron=[347,86,12,12];
  sourceIcon(head,'photo-edit',chevron,259,29,12,12);
  label(head,'最近项目',288,27,58,22,13);
  sourceIcon(head,'photo-edit',chevron,346,29,12,12).classList.add('picker-recents-chevron');
  let start;
  head.onpointerdown=e=>start=e.clientY;
  head.onpointerup=e=>{if(e.clientY-start>30)S.page==='photoPicker'?go('photoPrompt'):back();};
}
function pickerGrid(host,key,{y=114,height=610,rows=5,startY=114}={}){
 const grid=div(host,'gallery-area',0,y,375,height);
 for(let i=0;i<rows*3;i++){
   const col=i%3,row=Math.floor(i/3),x=col*125;
   // The original picker screenshot has a hint baked into the lower rows.
   const sourceRow=key==='picker'?row%3:row;
   const rect=[x,startY+sourceRow*125,124,124];
   const image=crop(grid,source(key),x,row*125,124,124,...rect);
   // Preview the sample artwork without the gallery controls baked into its tile.
   const photo=key==='picker'&&sourceRow===0&&col===0
     ?{src:source('case'),rect:[14,144,300,300]}
     :{src:source(key),rect:key==='picker'?[rect[0]+24,rect[1]+24,96,96]:rect};
   click(image,()=>{
     S.selected=S.selected===i+1?0:i+1;
     S.selectedCell=i;
     S.photo=S.selected?photo:null;
     render();
   },'选择第 '+(i+1)+' 张素材');
   if(S.selected===i+1){
     div(image,'picked-outline',0,0,124,124);
     const dot=div(image,'picked-dot',100,4.5,18,18);
     dot.textContent='1';
   }
 }
 const full=div(grid,'',0,rows*125-1,1,1);full.style.pointerEvents='none';return grid;}
function drawPicker(host,photo=false){const key=photo?'photo-edit':'picker';host.style.background='#fff';status(host,key,photo?'16:53':'22:35');selector(host,key);pickerGrid(host,key,{height:photo?610:535,rows:5});const footer=div(host,'picker-footer',0,photo?724:649,375,photo?88:163);footer.style.background='#fff';
 if(!photo){const selected=div(footer,'',11,12,63,63);selected.style.border='2px solid #1c2025';selected.style.borderRadius='10px';selected.style.background='#eef0f2';if(S.selected&&S.photo)crop(selected,S.photo.src,2,2,55,55,...S.photo.rect,7);label(footer,'Follow the tips above for optimal results',15,98,249,20,11,400,'#444');}
 const next=div(footer,'',275,photo?14:89,83,33);next.style.background=S.selected?'#55dce2':'#abe8ee';next.style.borderRadius='7px';const t=label(next,'Next',0,8,83,18,12,500,'white');t.style.textAlign='center';click(next,()=>{if(!S.selected)return;if(photo)go('photoPrompt');else go('uploaded');},'Next');
 if(!photo){
   const tip=div(host,'picker-tip',15,578,345,59);
   crop(tip,source('case'),11,11,37,37,49,132,266,266,5).classList.add('picker-tip-photo');
   label(tip,'Upload a photo to restyle like this',58,20,253,20,12,400,'white');
   const close=div(tip,'',313,4,28,28);
   const glyph=icon(close,'AI tool icon / close',8,8,12);
   glyph.style.filter='brightness(0) invert(1)';
   glyph.style.opacity='.7';
   click(close,()=>tip.remove(),'关闭提示');
   setTimeout(()=>{tip.style.opacity=0;tip.style.visibility='hidden';},2400);
 }
}
function drawPrompt(host,add=false){const key=add?'add-menu':'photo-prompt';host.style.background='linear-gradient(165deg,#fbfcff,#edf2f8)';status(host,key,add?'23:53':'16:53');const items=add?['Girls\nGenerate...','Little\nSPIDER...','Crying\ninfront of...','Versi\ncowok lu...']:['AutoCut','Trending\nPic','Ai Photo\nTemplate','Little\nPrincess'];const sy=add?238:257,sw=add?74:74;for(let i=0;i<5;i++){const x=(add?18:11)+i*82;const c=crop(host,source(key),x,sy,74,112,x,sy,74,112,12);click(c,()=>go('case'),items[i]||'查看灵感');}
 const box=div(host,'native-panel',15,add?357:375,345,add?132:114);const hint=add?'Up to 50 image, video, and audio references.\nUse only media you have rights and consent\nfor.':'Recommend some templates that match the\nuploaded media.';const field=editable(box,15,17,315,62,S.prompt||(!add?'Recommend some templates that match the uploaded media.':''),add?hint:'Recommend some templates that match the uploaded media.',v=>S.prompt=v);field.style.lineHeight='18px';sourceIcon(box,key,[26,448,31,31],11,add?90:72,31,31);sourceIcon(box,key,[64,448,31,31],49,add?90:72,31,31);sourceIcon(box,key,[281,448,31,31],266,add?90:72,31,31);sourceIcon(box,key,[318,448,31,31],303,add?90:72,31,31);hit(box,9,add?88:70,35,35,()=>picker('photoPrompt'),'添加素材');hit(box,47,add?88:70,35,35,()=>go('mode'),'选择模式');hit(box,300,add?88:70,36,35,()=>{S.task=true;go('uploading');},'发送');
 const drawer=div(host,'',0,500,375,312);drawer.style.background='#fff';drawer.style.borderRadius='16px 16px 0 0';selector(drawer,key,0);['Camera','Photos','Files'].forEach((s,i)=>{const tile=div(drawer,'',i*125,53,123,92);tile.style.background='#f3f3f5';tile.style.borderRadius='7px';sourceIcon(tile,key,[49+i*125,579,23,22],50,25,23,22);label(tile,s,0,50,123,20,12,400,'#60636b').style.textAlign='center';click(tile,()=>picker('photoPrompt'),s);});const grid=pickerGrid(drawer,key,{y:145,height:167,rows:2,startY:645});let start;drawer.onpointerdown=e=>start=e.clientY;drawer.onpointerup=e=>{if(e.clientY-start>45){drawer.style.transition='transform .25s';drawer.style.transform='translateY(260px)';field.focus();}};}
function drawActions(host,image=false){const key=image?'autocut-prompt':'video-prompt';host.style.background='linear-gradient(160deg,#f3f5f8 0%,#edf1f5 60%,#f7faff)';status(host,key,'23:55');const close=sourceIcon(host,key,[17,72,43,43],17,72,43,43);close.style.borderRadius='50%';click(close,back,'关闭');label(host,image?'For images':'For videos',15,157,140,20,13,400,'#929292');label(host,'Quick actions',15,178,240,29,19,700);const labels=image?['Change shot\nangle','Enhance\nquality','Remove\npeople','Retouch','Boost color','Blur\nbackground']:['AI ad maker','Emotional ad','Animate photo','Make a\nproduct ad','Remix a movie','AutoCut'];for(let i=0;i<6;i++){const x=i%2?196:15,y=215+Math.floor(i/2)*67;const tile=div(host,'',x,y,165,52);crop(tile,source(key),0,0,52,52,x,y,52,52,13);label(tile,labels[i],63,14,102,40,13,400);click(tile,()=>{S.pickerFrom='photoPicker';go('photoPicker');},labels[i].replaceAll('\n',' '));}
 label(host,'おすすめ',15,436,110,24,17,600);sourceIcon(host,key,[91,435,17,20],91,435,17,20);const strip=div(host,'',15,473,345,125);strip.style.borderRadius='16px';strip.style.overflow='hidden';for(let i=0;i<5;i++){const x=16+i*68;const c=crop(strip,source(key),i*68,0,68,125,x,474,68,125);click(c,()=>image?picker('imageActions'):go('case'),'打开同款案例');}label(host,image?'厳選テンプレ':'AI トレンド',15,622,180,25,17,600);sourceIcon(host,key,[15,661,345,10],15,661,345,10);composer(host,{mode:image?'Image':'Video',key});}
function drawCase(host,ai=false){const activeAI=ai&&S.aiFeedIndex!==1,src=source('case');host.style.background='#000';if(activeAI){const video=aiVideoPlayback('ai-feed-video');host.append(video);video.play().catch(()=>{});}else{crop(host,src,0,47,322,620,0,47,322,620);crop(host,src,322,47,53,620,322,47,1,620);const clean= crop(host,src,12,70,28,30,44,70,28,30);clean.classList.add('embedded-back-clean');clean.style.pointerEvents='none';}const backButton=div(host,'feed-back',8,63,40,40);const backGlyph=icon(backButton,'icon/back',10,10,20);backGlyph.style.filter='brightness(0) invert(1)';click(backButton,back,'返回');const avatar=crop(host,src,322,476,44,44,322,476,44,44,22);avatar.classList.add('feed-avatar');const follow=crop(host,src,333,507,22,22,333,507,22,22,11);click(follow,()=>{follow.style.opacity=follow.style.opacity==='0.6'?'1':'0.6';},'关注');
for(const [rect,y,text,action]of [[[330,544,30,30],544,'5.4K','喜欢'],[[330,606,30,30],608,'93','评论'],[[330,668,30,30],672,'1.1K','收藏']]){const c=feedGlyph(host,rect,329,y);if(action!=='评论')click(c,()=>{c.classList.toggle('tap-scale');c.style.opacity=c.style.opacity==='0.65'?'1':'0.65';},action);const count=label(host,text,324,y+33,40,20,11,400,'white');count.style.textAlign='center';count.classList.add('feed-count');}
label(host,activeAI?'AI video':'@rozirozi',12,674,180,20,13,400,'#eee');sourceIcon(host,'case',[12,698,19,19],12,698,19,19);label(host,activeAI?'24 UNFORGETTABLE':'Dual Style Dance',38,699,240,20,13,400,'#d7dde0');const make=div(host,'',11,728,274,38);make.style.background='linear-gradient(90deg,#75efdf,#6fe2ef)';make.style.borderRadius='7px';sourceIcon(make,'case',[87,737,17,18],76,10,17,18);label(make,'Make it yours',100,10,150,21,15,700);click(make,()=>go(activeAI?'videoForm':'form'),'Make it yours');const share=icon(host,'icon/share',329.5,734,29);share.classList.add('feed-share');share.style.filter='brightness(0) invert(1)';let start;host.onpointerdown=e=>start={x:e.clientX,y:e.clientY};host.onpointerup=e=>{if(!start)return;const dy=e.clientY-start.y,dx=e.clientX-start.x;if(Math.abs(dy)>60&&Math.abs(dy)>Math.abs(dx)){if(ai){S.aiFeedIndex=dy<0?1:0;render();}else{host.classList.add('tap-scale');setTimeout(()=>host.classList.remove('tap-scale'),250);}}};}
const feedGlyphCache=new Map();
function feedGlyph(host,rect,x,y){
  // Keep the white glyph pixels from the supplied screenshot and discard its gray matte.
  if(!document.getElementById('feed-glyph-definitions')){
    const defs=document.createElementNS('http://www.w3.org/2000/svg','svg');defs.id='feed-glyph-definitions';defs.setAttribute('width','0');defs.setAttribute('height','0');defs.style.position='absolute';
    defs.innerHTML='<defs><filter id="feed-white-glyph" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  1 1 1 0 -2"/></filter></defs>';document.body.append(defs);
  }
  const e=sourceIcon(host,'case',rect,x,y);e.classList.add('feed-glyph');e.dataset.alpha='fallback';e.style.filter='url(#feed-white-glyph)';
  const key=rect.join(',');
  if(!feedGlyphCache.has(key))feedGlyphCache.set(key,(async()=>{
    const im=new Image();im.src=source('case');await im.decode();
    const canvas=document.createElement('canvas');canvas.width=rect[2]*4;canvas.height=rect[3]*4;const c=canvas.getContext('2d',{willReadFrequently:true});
    c.drawImage(im,rect[0]/375*im.naturalWidth,rect[1]/812*im.naturalHeight,rect[2]/375*im.naturalWidth,rect[3]/812*im.naturalHeight,0,0,canvas.width,canvas.height);
    const pixels=c.getImageData(0,0,canvas.width,canvas.height);
    for(let i=0;i<pixels.data.length;i+=4){const white=Math.min(pixels.data[i],pixels.data[i+1],pixels.data[i+2]);pixels.data[i+3]=Math.round(pixels.data[i+3]*Math.max(0,Math.min(1,(white-160)/90)));pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=255;}
    c.putImageData(pixels,0,0);return canvas.toDataURL('image/png');
  })());
  feedGlyphCache.get(key).then(src=>{if(!e.isConnected)return;const im=new Image();im.src=src;im.alt='';im.draggable=false;im.style.cssText='display:block;width:100%;height:100%;pointer-events:none';e.replaceChildren(im);e.style.filter='none';e.dataset.alpha='ready';}).catch(()=>{});
  return e;
}
function drawKeyboard(host){const key='chat-keyboard';host.style.background='linear-gradient(#fafcfe,#eef4fa)';status(host,key,'00:06');const suggestions=['Muslim Woman Yellow Light','Cute Kid Billie Jean Dance','Cute Baby Dance Moments'];suggestions.forEach((s,i)=>{const b=div(host,'native-chip',15,239+i*50,[246,190,227][i],40);b.textContent=s;click(b,()=>{S.prompt=s;render();},s);});const box=div(host,'native-panel',15,389,345,100);const t=editable(box,15,15,315,38,S.prompt,'Cute Baby Dancing',v=>S.prompt=v);sourceIcon(box,key,[26,448,31,31],11,60,31,31);sourceIcon(box,key,[64,448,31,31],49,60,31,31);sourceIcon(box,key,[281,448,31,31],266,60,31,31);sourceIcon(box,key,[318,448,31,31],303,60,31,31);hit(box,301,57,36,36,()=>go('explore'),'发送');hit(box,10,59,32,32,()=>go('add'),'添加');hit(box,47,59,32,32,()=>go('mode'),'模式');const keyboard=div(host,'',0,500,375,312);keyboard.style.background='#cfd2d8';label(keyboard,'我　你　不　好　那　这　对　然后',12,14,330,24,17);sourceIcon(keyboard,key,[340,511,25,26],340,11,25,26);hit(keyboard,337,5,36,40,back,'收起键盘');const rows=['qwertyuiop','asdfghjkl','zxcvbnm'];rows.forEach((chars,r)=>{const x=r===0?3:r===1?22:59,y=49+r*50,w=33,gap=4;[...chars].forEach((ch,i)=>{const b=document.createElement('button');b.className='native-key';setBox(b,x+i*(w+gap),y,w,40);b.textContent=ch;b.onclick=()=>{S.prompt+=ch;t.value=S.prompt;};keyboard.append(b);});});for(const [rect,x,y,w,h] of [[[3,649,44,40],3,149,44,40],[[330,649,42,40],330,149,42,40],[[3,699,42,41],3,199,42,41],[[49,699,42,41],49,199,42,41],[[25,759,30,32],25,259,30,32],[[320,759,30,32],320,259,30,32]])sourceIcon(keyboard,key,rect,x,y,w,h);hit(keyboard,329,149,43,40,()=>{S.prompt=S.prompt.slice(0,-1);t.value=S.prompt;},'删除');const space=document.createElement('button');space.className='native-key';setBox(space,96,199,182,41);space.style.fontSize='17px';space.textContent='空格';space.onclick=()=>{S.prompt+=' ';t.value=S.prompt;};keyboard.append(space);const enter=document.createElement('button');enter.className='native-key dark';setBox(enter,282,199,90,41);enter.style.fontSize='17px';enter.textContent='换行';enter.onclick=()=>{S.prompt+='\n';t.value=S.prompt;};keyboard.append(enter);}
function renderAssistantBody(host){removeNode('676:3334');for(const id of ['679:5802','679:5803','679:5809','679:5812'])removeNode(id);if(S.previous==='history'&&S.historySession!=null){renderHistorySession(host,S.historySession);return;}const bubble=div(host,'native-panel',94,156,266,69);bubble.style.background='white';icon(bubble,'icon/share',15,15,15);const raw=F.hashes['c06ad98eef851edf1c7024d77fe677bcd1499912'];crop(bubble,raw,38,12,22,22,132,169,22,22,5);label(bubble,'Use the template to create a video',15,38,244,20,14);label(host,'To create this superhero cinematic video, please\nupload a portrait photo to become the main\ncharacter.',15,250,345,70,14);['Upload a superhero-style portrait','Create a superhero portrait from scratch','Use a dramatic comic-book background'].forEach((s,i)=>{label(host,s,15,344+i*33,327,20,13,400,'#56616a');crop(host,raw,348,344+i*33,12,12,348,344+i*33,12,12);hit(host,10,338+i*33,350,29,()=>picker('assistant'),s);});composer(host,{y:671,mode:'Image',key:'autocut-prompt'});}
function renderSpecial(key,host){if(key==='aiVideoFeed')drawCase(host,true);else if(key==='history')drawHistory(host);else if(key==='photoPicker')drawPicker(host,true);else if(key==='picker')drawPicker(host);else if(key==='photoPrompt')drawPrompt(host);else if(key==='add')drawPrompt(host,true);else if(key==='videoActions')drawActions(host);else if(key==='imageActions')drawActions(host,true);else if(key==='case')drawCase(host);else if(key==='keyboard')drawKeyboard(host);}
document.querySelector('#local-photo').addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{S.photo=reader.result;S.selected=1;go('uploaded');};reader.readAsDataURL(file);});
fit();go(new URLSearchParams(location.search).get('screen')||window.DEMO_START_PAGE||'home',false);
