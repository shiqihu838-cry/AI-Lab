/* History thumbnails and labels reproduce the user's supplied mobile reference. */
function historyThumbnail(parent,index,x,y,size=67){
  const r=HISTORY_ENTRIES[index].thumb;
  return crop(parent,source('history'),x,y,size,size,r[0]/525*375,r[1]/1141*812,r[2]/525*375,r[3]/1141*812,7);
}
function drawHistory(host){
  host.style.background='#fff';
  const heading=div(host,'history-heading',0,58,375,40);applyDesignLetterform(heading,'history:heading');
  const backButton=div(host,'history-back',10,58,40,40);icon(backButton,'icon/back',10,10,20);click(backButton,back,'返回');
  const list=div(host,'history-list',15,106,345,706);list.setAttribute('aria-label','创作历史列表');
  HISTORY_ENTRIES.forEach((entry,index)=>{
    const row=div(list,'history-entry',0,index*82,345,67);
    historyThumbnail(row,index,0,0);
    const title=div(row,'history-title',78,15,225,19);title.style.color='#10151f';applyDesignLetterform(title,`history:${index}:title`);
    const subtitle=div(row,'history-subtitle',78,39,255,16);subtitle.style.color='#656d7a';applyDesignLetterform(subtitle,`history:${index}:subtitle`);
    const time=div(row,'history-time',313,17,32,16);time.style.color='#656d7a';applyDesignLetterform(time,`history:${index}:time`);
    click(row,()=>{S.historySession=index;go('assistant');},entry.title);
  });
  div(list,'',0,82*6+14,1,1).style.pointerEvents='none';
}
function renderHistorySession(host,index){
  const entry=HISTORY_ENTRIES[index];
  const title=div(host,'history-session-title',15,108,345,20);applyDesignLetterform(title,`history:${index}:title`);
  const bubble=div(host,'native-panel',94,156,266,69);bubble.style.background='white';
  icon(bubble,'icon/share',15,15,15);historyThumbnail(bubble,index,38,12,22);
  const request=label(bubble,entry.subtitle,15,38,244,20,13);request.style.whiteSpace='nowrap';request.style.overflow='hidden';request.style.textOverflow='ellipsis';
  label(host,'To create this video, please upload a portrait photo\nto become the main character.',15,250,345,70,14);
  const raw=F.hashes['c06ad98eef851edf1c7024d77fe677bcd1499912'];
  ['Upload a portrait photo','Create a portrait from scratch','Use a new background'].forEach((text,i)=>{
    label(host,text,15,344+i*33,327,20,13,400,'#56616a');crop(host,raw,348,344+i*33,12,12,348,344+i*33,12,12);
    hit(host,10,338+i*33,350,29,()=>picker('assistant'),text);
  });
  composer(host,{y:671,mode:'Image',key:'autocut-prompt'});
}
