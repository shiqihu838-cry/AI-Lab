/* AI Trends: original artwork in one vertical document, with independent horizontal categories. */
function buildExplore(host){
  const root=rootNode(host);
  for(const id of ['153:5015','153:5016','153:5058','153:5059','558:6066','558:6067'])removeNode(id);
  const scroll=div(host,'explore-scroll',0,44,375,627);
  scroll.setAttribute('aria-label','AI Trends 内容');
  const content=div(scroll,'explore-content',0,0,375,1300);
  const composerNode=node('558:5823');
  for(const child of [...root.children]){
    if(child===composerNode||child.classList.contains('paint')||child.dataset.name==='iPhone X (or newer)')continue;
    const y=parseFloat(child.style.top)||0;
    content.append(child);child.style.top=(y-44)+'px';
  }
  const title=node('153:5023');title.style.left='59px';title.style.width='190px';
  const exit=div(content,'explore-exit',11,15,40,40);
  icon(exit,'icon/back',10,10,20);
  click(exit,()=>{S.history=[];S.trendsScroll=0;go(S.home||'home',false);},'返回 AI Lab');

  const hero=node('153:5024');
  let start=null,dragged=false,heroIndex=1;
  hero.style.touchAction='pan-y';
  hero.onpointerdown=e=>{start={x:e.clientX,y:e.clientY};dragged=false;};
  hero.onpointerup=e=>{
    if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;
    if(Math.abs(dx)>25&&Math.abs(dx)>Math.abs(dy)){
      dragged=true;heroIndex=Math.max(0,Math.min(2,heroIndex+(dx<0?1:-1)));
      hero.style.transition='left .35s ease';hero.style.left=(19.079345703125-heroIndex*291.296142578125)+'px';
    }
  };
  hero.onpointercancel=()=>{start=null;dragged=true;};
  click(hero,()=>{if(dragged){dragged=false;return;}S.trendsScroll=scroll.scrollTop;S.pickerFrom='videoForm';go('videoForm');},'Try It');

  const tabs=div(content,'explore-tabs',18,239,250,33);tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','案例类型');
  const tabButtons=[];
  ['All','Video','Image'].forEach((text,i)=>{
    const button=document.createElement('button');button.className='explore-tab';button.textContent=text;
    button.setAttribute('role','tab');button.onclick=()=>{S.tab=i;updateFeed();};tabs.append(button);tabButtons.push(button);
  });
  const categories=div(content,'explore-categories',0,281,375,34);
  const row=node('559:6092');categories.append(row);row.style.left='11.783203125px';row.style.top='0';
  const chips=[...row.children].filter(e=>e.dataset.id);
  const categoryNames=['Following','TikTok','Black Friday','PRO','Lifestyle'];
  chips.forEach((chip,i)=>click(chip,()=>{S.category=i;updateFeed();},categoryNames[i]));
  const grid=div(content,'explore-grid',0,322,375,1000);
  const gallery=F.hashes['78e5b57c59fe8404b7cd8cdbec675b325263fd34'];
  const cases=[
    {id:'h0',type:'Video',src:gallery,rect:[11,151,172,353]},
    {id:'h1',type:'Video',src:gallery,rect:[192,151,172,353]},
    {id:'v0',type:'Video',src:source('trends-video'),rect:[11,151,172,353]},
    {id:'v1',type:'Video',src:source('trends-video'),rect:[192,151,172,353]},
    {id:'i0',type:'Image',src:source('trends-image'),rect:[11,151,172,353]},
    {id:'i1',type:'Image',src:source('trends-image'),rect:[192,151,172,279]},
    {id:'i2',type:'Image',src:source('trends-image'),rect:[11,513,172,155]},
    {id:'i3',type:'Image',src:source('trends-image'),rect:[192,437,172,234]}
  ];
  // Demonstration feeds use only cases supplied by the user, preserving their screenshot crops.
  const categoryOrder=[['v0','i0','h0','i1','v1','h1','i2','i3'],['h0','h1','v0','v1','i0','i1','i2','i3'],['v0','i1','v1','i0','h1','h0','i3','i2'],['i0','v1','i1','v0','h0','h1','i2','i3'],['i1','i0','v0','v1','h1','h0','i3','i2']];
  function updateFeed(){
    tabButtons.forEach((button,i)=>{button.classList.toggle('is-selected',S.tab===i);button.setAttribute('aria-selected',String(S.tab===i));});
    chips.forEach((chip,i)=>{chip.style.boxShadow=`inset 0 0 0 ${S.category===i?1.2:.8}px ${S.category===i?'#11171d':'#cdd4dc'}`;chip.setAttribute('aria-pressed',String(S.category===i));});
    grid.replaceChildren();const heights=[0,0];
    const list=categoryOrder[S.category].map(id=>cases.find(c=>c.id===id)).filter(c=>S.tab===0||c.type===(S.tab===1?'Video':'Image'));
    list.forEach((item,i)=>{
      const col=i%2,h=item.rect[3],cell=crop(grid,item.src,[11,192][col],heights[col],172,h,...item.rect,7);
      cell.dataset.caseId=item.id;cell.dataset.caseType=item.type;
      click(cell,()=>{S.trendsScroll=scroll.scrollTop;go(item.type==='Video'?'case':'imageActions');},item.type==='Video'?'查看 AI 同款视频':'查看 AI 图片案例');
      heights[col]+=h+10;
    });
    const gridHeight=Math.max(...heights);grid.style.height=gridHeight+'px';content.style.height=(322+gridHeight+16)+'px';
    if(scroll.scrollTop>scroll.scrollHeight-scroll.clientHeight)scroll.scrollTop=Math.max(0,scroll.scrollHeight-scroll.clientHeight);
  }
  updateFeed();scroll.scrollTop=S.trendsScroll||0;scroll.addEventListener('scroll',()=>{S.trendsScroll=scroll.scrollTop;},{passive:true});
  composerNode.style.zIndex=40;bindInput(host,725);
  const history=node('558:6057');click(history,()=>S.task?go('assistant'):null,'创作历史');
}
