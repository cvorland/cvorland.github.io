
(function () {
  const root = document.getElementById('vorland-atlas');
  if (!root) return;
  const works = window.VORLAND.works;
  const districtData = window.VORLAND.districts;
  const artwork = window.VORLAND.artwork;
  const featured = window.VORLAND.featured;
  const featuredWhy = window.VORLAND.featuredDescriptions;
  const themes = window.VORLAND.themes;
  const tools = [
    {id:'lazy',title:'Lazy Scholar',since:'2013',status:'Free browser extension',description:'A free browser extension that brings research context to the paper you are reading.',detail:'Find accessible full text, collect citations, and surface contextual signals such as corrections, retractions, and post-publication discussion.',themes:['automation','reproducibility'],url:'https://chromewebstore.google.com/detail/lazy-scholar/fpbdcofpbclblalghaepibbagkkgpkak',link:'View the extension'},
    {id:'maarvin',title:'MAARVIN.ai',since:'2020',launched:'2026',status:'Invite-only beta',description:'Inspect a finding. Follow it back to the evidence.',detail:'Statistical, design, reference, and reporting checks link to source material in scientific PDFs to support expert review.',themes:['integrity','automation'],url:'https://maarvin.ai/',link:'Explore MAARVIN.ai'},
    {id:'writing',title:'I Should Be Writing',since:'2017',status:'Writing without AI',description:'A silly little website for writing without AI.',detail:'Set a timer or a word-count goal, then do the writing yourself. Track progress or write alongside others.',themes:['automation'],url:'https://ishouldbewriting.net/',link:'Start writing'},
    {id:'metaresearch',title:'metaresearch.ai',status:'Coming soon',comingSoon:true,description:'Software to facilitate meta-research projects.',detail:'Coming soon.',themes:['automation'],url:null,link:null}
  ];
  const state = {island:null,district:null,kind:'overview',selected:null,view:'map',nav:'research'};
  const mobileQuery=window.matchMedia('(max-width:740px)');
  const isMobile=()=>mobileQuery.matches;
  let expanded=false,mobileOrigin=null,mobileTrigger=null,bodyLock=null;
  const design = {paper:true,labels:'serif',background:'dark',expedition:Boolean(window.VORLAND.ships?.length)};
  const ships=window.VORLAND.ships||[];
  root.querySelector('.ea-key-ship').hidden=!ships.length;
  const shipsForTheme=id=>ships.filter(ship=>ship.theme===id);
  let hoveredWork=null,hoveredTheme=null;
  /* Atlas map marks. Insert in the atlas script's existing local scope. */
function cityMark(count, featured) {
  const total = Math.max(0, Math.min(6, Math.round(Number(count) || 0)));
  const plots = [
    { x: 48, y: 28, w: 17, d: 11, h: 7, turn: -7 },
    { x: 73, y: 31, w: 15, d: 11, h: 6, turn: 8 },
    { x: 79, y: 53, w: 19, d: 11, h: 6, turn: 8 },
    { x: 51, y: 62, w: 17, d: 11, h: 7, turn: -7 },
    { x: 27, y: 49, w: 18, d: 12, h: 6, turn: -7 },
    { x: 25, y: 26, w: 14, d: 10, h: 5, turn: -7 }
  ];
  const roads = '<path class="ea-city-street ea-city-street-main" d="M13 64 Q28 63 37 48 Q44 37 57 42 Q75 49 101 37"/><path class="ea-city-street" d="M35 13 38 35 37 48 M57 42 64 69 M59 43 85 68"/>';
  const plaza = '<path class="ea-city-plaza" d="M48 42 57 38 65 43 57 49Z"/><path class="ea-city-plaza-line" d="M51 42 57 45 62 43"/>';
  const buildings = plots.slice(0, total).map((plot, index) => {
    const landmark = !!featured && index === 0;
    return `<g class="ea-city-building${landmark ? ' ea-city-building-featured' : ''}" data-paper-mark="${index + 1}" transform="translate(${plot.x} ${plot.y}) rotate(${plot.turn})">${atlasBuildingShape(plot.w, plot.d, plot.h, landmark)}</g>`;
  }).join('');
  return `<svg class="ea-city-mark" viewBox="0 0 120 82" aria-hidden="true" focusable="false" data-paper-count="${total}">${roads}${plaza}${buildings}</svg>`;
}

function paperBuilding(featured, preprint) {
  const draft = preprint ? ' ea-paper-building-draft' : '';
  const foundation = preprint ? '<path class="ea-building-scaffold" d="M9 26 22 20 37 27 35 38 21 44 7 36Z M9 26 7 36 M22 20 21 44 M37 27 35 38"/>' : '';
  return `<svg class="ea-paper-building${featured ? ' ea-paper-building-featured' : ''}${draft}" viewBox="0 0 44 46" aria-hidden="true" focusable="false">${foundation}<g class="ea-city-building${featured ? ' ea-city-building-featured' : ''}" transform="translate(22 32)">${atlasBuildingShape(23, 14, 8, !!featured)}</g></svg>`;
}

function atlasBuildingShape(width, depth, height, featured) {
  const a = width / 2;
  const b = depth / 2;
  const skew = depth * .34;
  const roof = `${-a},${-height} ${-skew},${-b-height} ${a},${-height} ${skew},${b-height}`;
  const left = `${-a},${-height} ${skew},${b-height} ${skew},${b} ${-a},0`;
  const right = `${skew},${b-height} ${a},${-height} ${a},0 ${skew},${b}`;
  const building = `<path class="ea-building-shadow" d="M${-a+2} 2 ${skew+3} ${b+3} ${a+5} 2 ${a} -2Z"/><polygon class="ea-building-wall" points="${left}"/><polygon class="ea-building-wall-shade" points="${right}"/><polygon class="ea-building-roof" points="${roof}"/><path class="ea-building-ridge" d="M${-a*.52} ${-height-.7} ${-skew*.08} ${-b*.49-height} ${a*.5} ${-height-.7}"/><path class="ea-building-window" d="M${-a*.48} ${-height+3.1} ${-a*.19} ${-height+4.2} M${a*.58} ${-height+2.7} ${a*.58} ${-height+5.1}"/>`;
  if (!featured) return building;
  const towerBase = -height + 1;
  const towerTop = towerBase - 13;
  return building + `<g class="ea-building-observatory"><path class="ea-building-tower-shadow" d="M-3 ${towerBase} 8 ${towerBase+3} 4 ${towerBase+5} -5 ${towerBase+1}Z"/><path class="ea-building-tower" d="M-4 ${towerTop} 4 ${towerTop} 4 ${towerBase} 0 ${towerBase+2} -4 ${towerBase}Z"/><path class="ea-building-tower-side" d="M0 ${towerTop+1} 4 ${towerTop} 4 ${towerBase} 0 ${towerBase+2}Z"/><path class="ea-building-dome" d="M-5 ${towerTop} Q-5 ${towerTop-6} 0 ${towerTop-6} Q5 ${towerTop-6} 5 ${towerTop} Q0 ${towerTop+3} -5 ${towerTop}Z"/><path class="ea-building-dome-rib" d="M0 ${towerTop-6} Q-2 ${towerTop-2} 0 ${towerTop+1}"/><path class="ea-building-lamp" d="M-2 ${towerTop+4} -2 ${towerTop+7} M2 ${towerTop+4} 2 ${towerTop+7}"/></g>`;
}
  /* Spatial map helpers. Insert into the atlas's existing local scope. */
function districtEntries(d) {
  const featureId = featured[d.theme];
  const paperEntries = d.works.map(id => byId(works, id)).filter(item=>item&&!item.isShip)
    .map(item => ({ kind: 'work', id: item.id, item }));
  const featureIndex = paperEntries.findIndex(entry => entry.id === featureId);
  if (featureIndex > 0) paperEntries.unshift(paperEntries.splice(featureIndex, 1)[0]);
  const toolEntries = toolsForDistrict(d.id).map(item => ({ kind: 'tool', id: item.id, item }));
  return paperEntries.concat(toolEntries);
}

function makeSpatialFeatures() {
  const features=[],markup=[],occupied=new Set();
  const attributes=(kind,id,d,label)=>' type="button" data-spatial-type="'+kind+'" data-spatial-id="'+esc(id)+'" data-home-theme="'+d.theme+'" data-home-district="'+d.id+'" data-tooltip="'+esc(label)+'" aria-label="'+esc(label)+'"';
  allDistricts.forEach(d=>{
    const p=cityPositions[d.id],t=byId(themes,d.theme),entries=districtEntries(d);
    markup.push('<button class="ea-spatial-city"'+attributes('district',d.id,d,d.title+' — '+districtCount(d))+'><span class="ea-spatial-name">'+esc(d.title)+'</span></button>');
    features.push({kind:'district',id:d.id,district:d.id,theme:d.theme,x:p.x,y:p.y});
    const neighbors=allDistricts.filter(x=>x.theme===d.theme).map(x=>cityPositions[x.id]);
    const candidates=[];
    for(let y=t.bounds.y+20;y<t.bounds.bottom-20;y+=20){
      for(let x=t.bounds.x+20;x<t.bounds.right-20;x+=24){
        const key=Math.round(x)+','+Math.round(y);
        if(occupied.has(key)||![[0,0],[-14,0],[14,0],[0,14],[0,-20]].every(o=>inside(x+o[0],y+o[1],t.coast)))continue;
        const distance=Math.hypot(x-p.x,y-p.y),nearest=Math.min(...neighbors.map(n=>Math.hypot(x-n.x,y-n.y)));
        candidates.push({x,y,key,distance:distance+(distance>nearest+.01?10000:0)});
      }
    }
    candidates.sort((a,b)=>a.distance-b.distance);
    if(candidates.length<entries.length)throw new Error('Insufficient map space for '+d.id);
    entries.forEach((entry,i)=>{
      const q=candidates[i],item=entry.item;occupied.add(q.key);
      const highlight=entry.kind==='work'&&featured[d.theme]===entry.id;
      const secondary=entry.kind==='work'&&item.primary!==d.theme;
      const label=(entry.kind==='work'?citationText(item):item.title+' — Software · '+item.status)+(highlight?'\nFeatured work':'')+(secondary?'\nConnected work; home: '+byId(themes,item.primary).title:'');
      markup.push('<button class="ea-spatial-building'+(secondary?' ea-secondary-marker':'')+'"'+attributes(entry.kind,entry.id,d,label)+'></button>');
      features.push({kind:entry.kind,id:entry.id,district:d.id,theme:d.theme,x:q.x,y:q.y-6,featured:highlight,secondary,comingSoon:item.comingSoon});
    });
  });
  spatialLayer.innerHTML=markup.join('');
  const buttons=spatialLayer.querySelectorAll('button');features.forEach((f,i)=>f.button=buttons[i]);return features;
}
  const map = root.querySelector('.ea-map');
  const svg = root.querySelector('.ea-map-svg');
  const controls = root.querySelector('.ea-map-buttons');
  const cityControls = root.querySelector('.ea-city-buttons');
  const softwareControls = root.querySelector('.ea-software-buttons');
  const spatialLayer = root.querySelector('.ea-spatial-features');
  const cityRoads = root.querySelector('.ea-city-roads');
  const shipLayer=root.querySelector('.ea-ships');
  const panel = root.querySelector('.ea-panel-body');
  const kicker = root.querySelector('.ea-panel-kicker');
  const close = root.querySelector('.ea-close');
  const back = root.querySelector('.ea-back');
  const up = root.querySelector('.ea-up');
  const preview = root.querySelector('.ea-map-preview');
  const zoomLabel = root.querySelector('.ea-zoom-label');
  const list = root.querySelector('.ea-list');
  const index = root.querySelector('.ea-island-index');
  const live = root.querySelector('[role=status]');
  const explorer=root.querySelector('.ea-explorer'),inspector=root.querySelector('.ea-inspector');
  const inspectorHome=inspector.parentNode,sheet=root.querySelector('.ea-mobile-sheet');
  const mobileContext=root.querySelector('.ea-mobile-context'),mobileCities=root.querySelector('.ea-mobile-cities');
  const mobileSoftware=root.querySelector('.ea-mobile-software'),islandSelect=root.querySelector('.ea-mobile-island');
  const byId = (items,id) => items.find(item => item.id===id);
  const softwareHomes={lazy:{automation:'automation-workflow',reproducibility:districtData.find(t=>t.id==='reproducibility').districts.find(d=>/sharing|availability|access/i.test(d.id+' '+d.title)).id},maarvin:{automation:'automation-review',integrity:districtData.find(t=>t.id==='integrity').districts[0].id},writing:{automation:'automation-workflow'},metaresearch:{automation:'automation-workflow'}};
  const toolsForTheme=id=>tools.filter(t=>t.themes.includes(id));
  const toolsForDistrict=id=>tools.filter(t=>Object.values(softwareHomes[t.id]).includes(id));
  const currentTools=()=>state.district?toolsForDistrict(state.district):state.island?toolsForTheme(state.island):tools;
  const primaryPapers=id=>papersFor(id).filter(w=>w.isPaper&&w.primary===id);
  const connectedPapers=id=>papersFor(id).filter(w=>w.isPaper&&w.primary!==id);
  const themeCount=id=>primaryPapers(id).length+' primary papers · '+connectedPapers(id).length+' connected';
  const districtCount=d=>[d.works.length?d.works.length+' '+(d.works.length===1?'output':'outputs'):'',toolsForDistrict(d.id).length?toolsForDistrict(d.id).length+' '+(toolsForDistrict(d.id).length===1?'tool':'tools'):''].filter(Boolean).join(' · ');
  const esc = value => String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const publicationLine = w => [w.venueLabel||w.venue||'Venue not specified',w.year||'Year not specified',w.isShip?'Work in progress · '+w.typeLabel:'',w.preprint?'Preprint · not peer reviewed':''].filter(Boolean).join(' · ');
  const authorText = w => (w.authors||[]).map(a=>a.name).join('; ')||'Authors not specified';
  const citationText = w => w.title+'\n'+publicationLine(w)+'\n'+authorText(w);
  const citation = w => '<span class="ea-citation" data-citation-work="'+w.id+'"><span class="ea-citation-venue">'+esc(publicationLine(w))+'</span><span class="ea-citation-authors">'+(w.authors||[]).map(a=>/vorland/i.test(a.name)?'<strong>'+esc(a.name)+'</strong>':esc(a.name)).join('; ')+'</span></span>';
  const toolHistory = t => t.comingSoon?'Coming soon':'Since '+t.since+(t.launched?' · Launched '+t.launched:'');
  const papersFor = id => works.filter(w=>w.themes.includes(id)).sort((a,b)=>Number(b.year)-Number(a.year)||a.title.localeCompare(b.title));
  const districtsFor = id => byId(districtData,id).districts;
  const allDistricts = districtData.flatMap(t=>t.districts.map(d=>({...d,theme:t.id})));
  const districtForWork = (theme,id) => districtsFor(theme).find(d=>d.works.includes(id));
  const districtWorks = id => byId(allDistricts,id).works.map(id=>byId(works,id)).sort((a,b)=>Number(b.year)-Number(a.year)||a.title.localeCompare(b.title));
  const currentWorks = () => state.district ? districtWorks(state.district) : state.island ? papersFor(state.island) : works;
  const isFeatured = (w,theme=state.island) => theme ? featured[theme]===w.id : Object.values(featured).includes(w.id);
  const featuredTag = w => isFeatured(w)?'<span class="ea-featured-label">Featured work</span>':'';
  const color = id => byId(themes,id).color;
  const reduced = () => window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const path = points => points.map((p,i)=>(i?'L':'M')+p[0].toFixed(2)+','+p[1].toFixed(2)).join(' ')+' Z';
  const area = points => Math.abs(points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p[0]*q[1]-q[0]*p[1];},0))/2;
  const inside = (x,y,points) => {
    let result=false;
    for(let i=0,j=points.length-1;i<points.length;j=i++) {
      const a=points[i],b=points[j];
      if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])result=!result;
    }
    return result;
  };
  const section = (label,html) => '<div class="ea-panel-section"><div class="ea-eyebrow">'+esc(label)+'</div>'+html+'</div>';
  const openLink = (url,label) => '<a class="ea-open-link" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer"><span>'+esc(label)+'</span><span aria-hidden="true">↗</span></a>';
  const themeLinks = (ids,workId=null) => '<div class="ea-related-themes">'+ids.map(id=>'<button type="button" '+(workId?'data-locate-work="'+workId+'" data-locate-theme="'+id+'"':'data-theme="'+id+'"')+'>'+esc(byId(themes,id).title)+'</button>').join('')+'</div>';
  const itemCore = w => '<button type="button" class="ea-panel-item" data-work="'+w.id+'" aria-pressed="false"><span class="ea-item-index">'+w.n+'</span><span class="ea-item-name">'+esc(w.title)+citation(w)+'</span></button>';
  const workRowCore = w => '<button type="button" class="ea-list-row'+(isFeatured(w)?' ea-featured':'')+'" data-work="'+w.id+'" data-featured="'+isFeatured(w)+'" aria-pressed="false"><span class="ea-item-index">'+w.n+'</span><span class="ea-item-name">'+esc(w.title)+featuredTag(w)+citation(w)+'</span></button>';
  const shipItem = ship => {const w=byId(works,ship.work);return '<button type="button" class="ea-panel-item" data-expedition="'+ship.work+'"><span class="ea-item-name"><span class="ea-item-meta">'+esc(ship.label)+' · '+esc(ship.title)+'</span>'+esc(w.title)+citation(w)+'</span><span aria-hidden="true">↗</span></button>';};
  const scienceIcons={preprint:['file-text','Preprint'],data:['database','Shared data'],code:['code-xml','Shared code'],registration:['clipboard-check','Registration'],protocol:['list-checks','Protocol'],'open-access':['lock-keyhole-open','Open access']};
  const scienceBadges=w=>{const shown=new Set();return '<div class="open-science" aria-label="Open-science resources">'+(w.open_science||[]).filter(a=>scienceIcons[a.kind]&&!shown.has(a.kind)&&shown.add(a.kind)).map(a=>'<a class="science-link" href="'+esc(a.url)+'" target="_blank" rel="noopener noreferrer" aria-label="'+esc(scienceIcons[a.kind][1]+': '+a.label)+'"><img src="assets/icons/'+scienceIcons[a.kind][0]+'.svg" alt=""><span class="science-label">'+scienceIcons[a.kind][1]+'</span></a>').join('')+'</div>';};
  const item=w=>'<div class="ea-panel-publication">'+itemCore(w)+scienceBadges(w)+'</div>';
  scienceIcons.materials=['folder-open','Shared materials'];
  const workRow=w=>'<div class="ea-listed-work">'+workRowCore(w)+scienceBadges(w)+'</div>';
  const districtItem = d => '<button type="button" class="ea-panel-item" data-district="'+d.id+'"><span class="ea-item-name">'+esc(d.title)+'<span class="ea-item-meta">'+districtCount(d)+'</span></span><span aria-hidden="true">↗</span></button>';
  const toolRow=t=>'<button type="button" class="ea-list-row ea-software-row" data-tool="'+t.id+'" aria-pressed="false"><span class="ea-item-name"><span class="ea-software-type">Software · '+esc(toolHistory(t))+'</span><span class="ea-software-name">'+esc(t.title)+'</span><span class="ea-item-meta">'+esc(t.description)+'</span></span><span class="ea-item-arrow" aria-hidden="true">↗</span></button>';
  const toolItem=t=>'<button type="button" class="ea-panel-item ea-software-item" data-tool="'+t.id+'"><span class="ea-item-name"><span class="ea-software-type">Software</span>'+esc(t.title)+'<span class="ea-item-meta">'+esc(toolHistory(t))+'</span></span><span aria-hidden="true">↗</span></button>';

  // The supplied alpha outline measures the artwork's visible footprint.
  // Scale the original image uniformly; canvas padding does not encode counts.
  themes.forEach(theme=>{
    const asset=artwork[theme.id];
    if(!asset||!Array.isArray(asset.outline)||asset.outline.length<3||!asset.width||!asset.height)throw new Error('Missing island artwork: '+theme.id);
    theme.papers=papersFor(theme.id);
    theme.count=primaryPapers(theme.id).length;
    const raw=asset.outline.map(p=>[p[0]-asset.cx,p[1]-asset.cy]);
    const measuredArea=area(raw);
    if(!(measuredArea>0))throw new Error('Invalid artwork outline: '+theme.id);
    const scale=Math.sqrt(Math.max(1,theme.count)*11000/measuredArea);
    theme.local=raw.map(p=>[p[0]*scale,p[1]*scale]);
    theme.coast=theme.local.map(p=>[p[0]+theme.x,p[1]+theme.y]);
    const xs=theme.coast.map(p=>p[0]),ys=theme.coast.map(p=>p[1]);
    theme.bounds={x:Math.min(...xs),y:Math.min(...ys),right:Math.max(...xs),bottom:Math.max(...ys)};
    theme.bounds.w=theme.bounds.right-theme.bounds.x;theme.bounds.h=theme.bounds.bottom-theme.bounds.y;
    theme.rx=theme.bounds.w/2;theme.ry=theme.bounds.h/2;
    theme.imageRect={x:theme.x-asset.cx*scale,y:theme.y-asset.cy*scale,w:asset.width*scale,h:asset.height*scale};
  });
  // Repack when the map crosses the two/three-column breakpoint.
  const allBounds={},cityPositions={};let layoutColumns=0;
  function arrangeIslands(){
  const gap=135,columns=map.clientWidth<620?2:3,rows=[];layoutColumns=columns;
  for(let i=0;i<themes.length;i+=columns)rows.push(themes.slice(i,i+columns));
  const rowWidths=rows.map(row=>row.reduce((n,t)=>n+t.bounds.w,0)+gap*(row.length-1));
  const maxWidth=Math.max(...rowWidths);let rowY=0;
  rows.forEach((row,r)=>{
    const height=Math.max(...row.map(t=>t.bounds.h));let x=(maxWidth-rowWidths[r])/2;
    row.forEach(t=>{
      const nx=x+t.bounds.w/2,ny=rowY+height/2;
      const dx=nx-t.x,dy=ny-t.y;t.x=nx;t.y=ny;
      t.coast=t.local.map(p=>[p[0]+nx,p[1]+ny]);
      t.bounds.x+=dx;t.bounds.right+=dx;t.bounds.y+=dy;t.bounds.bottom+=dy;t.imageRect.x+=dx;t.imageRect.y+=dy;
      x+=t.bounds.w+gap;
    });rowY+=height+gap;
  });
  Object.assign(allBounds,{x:Math.min(...themes.map(t=>t.bounds.x))-135,y:Math.min(...themes.map(t=>t.bounds.y))-40,right:Math.max(...themes.map(t=>t.bounds.right))+135,bottom:Math.max(...themes.map(t=>t.bounds.bottom))+135});
  allBounds.w=allBounds.right-allBounds.x;allBounds.h=allBounds.bottom-allBounds.y;

  themes.forEach(t=>{
    const districts=districtsFor(t.id),fractions=districts.map((_,i)=>(.09+i/districts.length)%1);
    districts.forEach((d,i)=>{
      const p=t.local[Math.floor(fractions[i]*t.local.length)];
      cityPositions[d.id]={x:t.x+p[0]*.48,y:t.y+p[1]*.48};
    });
  });
  }
  arrangeIslands();
  const cityPackingCache=new Map();
  function packedCities(view,width,height) {
    if(!state.island)return cityPositions;
    const key=state.island+'|'+width+'|'+height;
    if(cityPackingCache.has(key))return cityPackingCache.get(key);
    const t=byId(themes,state.island),districts=districtsFor(t.id);
    const coast=t.coast.map(p=>[(p[0]-view.x)/view.w*width,(p[1]-view.y)/view.h*height]);
    const center={x:(t.x-view.x)/view.w*width,y:(t.y-view.y)/view.h*height};
    let best=[],score=Infinity;
    for(let oy=0;oy<4;oy++)for(let ox=0;ox<4;ox++){
      const candidates=[];
      for(let y=130+oy*15;y<=height-62;y+=116)for(let x=65+ox*13;x<=width-65;x+=132){
        if(inside(x,y,coast)&&[[42,0],[-42,0],[0,35],[0,-35]].every(p=>inside(x+p[0],y+p[1],coast)))candidates.push({x,y,d:Math.pow(x-center.x,2)+Math.pow(y-center.y,2)});
      }
      candidates.sort((a,b)=>a.d-b.d);
      const chosen=candidates.slice(0,districts.length),cost=chosen.reduce((v,p)=>v+p.d,0);
      if(chosen.length>best.length||(chosen.length===best.length&&cost<score)){best=chosen;score=cost;}
    }
    // A compact, readable fallback keeps every named district reachable even
    // if a future coastline cannot contain this many separated label centers.
    if(best.length<districts.length){
      best=districts.map((d,i)=>({x:districts.length===3&&i===2?width/2:width/2-62+(i%2)*124,y:Math.max(146,center.y-52)+Math.floor(i/2)*110}));
    }
    best.sort((a,b)=>Math.abs(a.y-b.y)>8?a.y-b.y:a.x-b.x);
    const out={};districts.forEach((d,i)=>out[d.id]={x:view.x+best[i].x/width*view.w,y:view.y+best[i].y/height*view.h});
    cityPackingCache.set(key,out);return out;
  }

  let camera=null,frame=0,geometryKey='',lastWidth=0,lastHeight=0;
  const vesselPositionCache=new Map();
  let nodePositions={};
  // Pack in projected pixels: coastlines keep their statistical area, while
  // labels and touch targets retain readable, non-overlapping screen sizes.
  const packingCache=new Map();
  function packedPositions(view,width,height) {
    if(!state.district){root.dataset.pinLabels='false';return {};}
    const districtPapers=currentWorks().concat(currentTools().map(t=>({...t,id:'tool:'+t.id})));
    const key=state.island+'|'+state.district+'|'+width+'|'+height;
    if(packingCache.has(key)){const cached=packingCache.get(key);root.dataset.pinLabels=String(cached.labelled);return cached.positions;}
    const t=byId(themes,state.island);
    const coast=t.coast.map(p=>[(p[0]-view.x)/view.w*width,(p[1]-view.y)/view.h*height]);
    const city=packedCities(islandCamera(width,height),width,height)[state.district];
    const center={x:(city.x-view.x)/view.w*width,y:(city.y-view.y)/view.h*height};
    const attempt=(labelled,inset=16)=>{
      const dx=labelled?110:52,dy=labelled?88:62;
      const halfW=labelled?50:inset,halfH=labelled?38:inset;
      let best=[];
      for(let oy=0;oy<4;oy++)for(let ox=0;ox<4;ox++) {
        const candidates=[];
        let row=0;
        for(let y=halfH+58+oy*dy/4;y<=height-halfH-8;y+=dy,row++) {
          const shift=labelled?0:(row%2)*dx/2;
          for(let x=halfW+8+ox*dx/4+shift;x<=width-halfW-8;x+=dx) {
            const fits=inside(x,y,coast)&&[[halfW,0],[-halfW,0],[0,halfH],[0,-halfH]].every(p=>inside(x+p[0],y+p[1],coast));
            if(fits)candidates.push({x,y,d:Math.pow((x-center.x)/width,2)+Math.pow((y-center.y)/height,2)});
          }
        }
        if(candidates.length>best.length)best=candidates;
      }
      return best;
    };
    let labelled=width>=470,candidates=labelled?attempt(true):[];
    if(candidates.length<districtPapers.length){labelled=false;candidates=attempt(false);}
    if(candidates.length<districtPapers.length)candidates=attempt(false,5);
    candidates.sort((a,b)=>a.d-b.d);
    const chosen=candidates.slice(0,districtPapers.length).sort((a,b)=>Math.abs(a.y-b.y)>8?a.y-b.y:a.x-b.x);
    const out={};
    districtPapers.forEach((w,i)=>{
      const p=chosen[i];
      if(p)out[w.id]={x:view.x+p.x/width*view.w,y:view.y+p.y/height*view.h};
    });
    root.dataset.pinLabels=String(labelled);
    packingCache.set(key,{labelled,positions:out});
    return out;
  }

  controls.innerHTML=themes.map(theme=>{
    const b=theme.bounds;
    const clip='polygon('+theme.coast.map(p=>((p[0]-b.x)/b.w*100).toFixed(2)+'% '+((p[1]-b.y)/b.h*100).toFixed(2)+'%').join(',')+')';
    return '<button type="button" class="ea-island-hit" data-theme="'+theme.id+'" style="clip-path:'+clip+'" aria-label="Explore '+esc(theme.title)+', '+themeCount(theme.id)+'"></button><button type="button" class="ea-island-label" data-theme="'+theme.id+'" style="--tone:'+theme.color+'" data-tooltip="'+esc('Main focus: '+theme.description)+'" aria-label="Zoom into '+esc(theme.title)+', '+themeCount(theme.id)+'"><strong>'+theme.label+'</strong><small>'+themeCount(theme.id)+'</small><span class="ea-mobile-count">'+theme.count+' papers</span></button>';
  }).join('')+works.filter(w=>!w.isShip).map(w=>'<button type="button" class="ea-node" data-tooltip="'+esc(citationText(w))+'" data-work="'+w.id+'" data-preprint="'+Boolean(w.preprint)+'" style="--tone:'+color(w.primary)+'" aria-label="'+esc(citationText(w))+'" aria-pressed="false">'+paperBuilding(Object.values(featured).includes(w.id),Boolean(w.preprint))+'<span class="ea-node-index" aria-hidden="true">'+w.n+'</span><span class="ea-node-label" aria-hidden="true">'+esc(w.short)+'<small>'+w.year+(w.preprint?' · Preprint':'')+'</small></span></button>').join('');
  cityControls.innerHTML=allDistricts.map(d=>'<div class="ea-city-group" data-city="'+d.id+'" style="--tone:'+color(d.theme)+'"><button type="button" class="ea-city" data-district="'+d.id+'" aria-label="'+esc(d.title)+', '+districtCount(d)+'" aria-pressed="false">'+cityMark(d.works.length+toolsForDistrict(d.id).length,d.works.includes(featured[d.theme]))+'<span class="ea-city-name">'+esc(d.title)+'</span><span class="ea-city-count">'+districtCount(d)+'</span></button>'+(d.works.includes(featured[d.theme])?'<button type="button" class="ea-landmark-entry" data-work="'+featured[d.theme]+'" aria-label="Open featured paper: '+esc(byId(works,featured[d.theme]).short)+'"><span aria-hidden="true">✦</span> Featured work</button>':'')+'</div>').join('');
  softwareControls.innerHTML=tools.map(t=>'<button type="button" class="ea-software-pin" data-tool="'+t.id+'" aria-label="Explore software: '+esc(t.title)+'">'+paperBuilding(false,false)+'<span class="ea-software-type">Software</span><strong><span class="ea-tool-full">'+esc(t.title)+'</span><span class="ea-tool-short">'+({lazy:'Lazy Scholar',maarvin:'MAARVIN.ai',writing:'ISBW'}[t.id])+'</span></strong></button>').join('');
  let spatialFeatures=makeSpatialFeatures();
  shipLayer.innerHTML=ships.map(ship=>'<button type="button" class="ea-expedition" data-expedition="'+ship.work+'" data-ship-theme="'+ship.theme+'" data-tooltip="'+esc(citationText(byId(works,ship.work))+'\nHome island: '+byId(themes,ship.theme).title)+'" aria-label="'+esc(citationText(byId(works,ship.work)))+'"><span class="ea-expedition-icon"><img src="assets/icons/ship.svg" alt=""></span><strong>'+esc(ship.label)+'</strong><small>'+esc(byId(works,ship.work).year)+'</small></button>').join('');

  const launchPurpose={lazy:'Free browser extension for full text and research context.',maarvin:'Inspect scientific evidence.',writing:'A silly little website for writing without AI.',metaresearch:'Software to facilitate meta-research projects.'};
  root.querySelector('.ea-tool-showcase').innerHTML='<h2>Software I build</h2>'+tools.map(t=>{
    const tag=t.comingSoon?'div':'a';
    return '<div class="ea-launch-item'+(t.comingSoon?' ea-coming-soon':'')+'"><'+tag+' class="ea-launch-link"'+(t.comingSoon?'':' href="'+esc(t.url)+'" target="_blank" rel="noopener noreferrer"')+'><span class="ea-launch-heading"><strong>'+esc(t.title)+(t.comingSoon?'':' <span aria-hidden="true">↗</span>')+'</strong><span class="ea-launch-history">'+(t.comingSoon?'Coming soon':'Since '+esc(t.since))+'</span></span>'+(t.launched?'<span class="ea-launch-release">Launched '+esc(t.launched)+'</span>':'')+'<span class="ea-launch-purpose">'+launchPurpose[t.id]+'</span></'+tag+'>'+(t.comingSoon?'':'<button type="button" class="ea-launch-context" data-tool="'+t.id+'" aria-label="Related research for '+esc(t.title)+'">Related research →</button>')+'</div>';
  }).join('');

  mobileSoftware.innerHTML=tools.map(t=>{
    const tag=t.comingSoon?'div':'a';
    return '<'+tag+(t.comingSoon?' class="ea-coming-soon"':' href="'+esc(t.url)+'" target="_blank" rel="noopener noreferrer"')+'><strong>'+esc(t.title)+(t.comingSoon?'':' ↗')+'</strong><small>'+esc(t.comingSoon?'Coming soon':t.id==='lazy'?'Free browser extension · Since '+t.since:toolHistory(t))+'</small></'+tag+'>';
  }).join('');
  islandSelect.innerHTML='<option value="">All islands</option>'+themes.map(t=>'<option value="'+t.id+'">'+esc(t.title)+'</option>').join('');

  function fit(bounds,width,height) {
    let w=bounds.w,h=bounds.h;
    if(w/h<width/height) w=h*width/height;else h=w*height/width;
    return {x:bounds.x+bounds.w/2-w/2,y:bounds.y+bounds.h/2-h/2,w,h};
  }
  function islandCamera(width,height) {
    const t=byId(themes,state.island),b=t.bounds;
    return fit({x:b.x-b.w*.065,y:b.y-b.h*.21,w:b.w*1.13,h:b.h*1.34},width,height);
  }
  function targetCamera(width,height) {
    if(!state.island)return fit(allBounds,width,height);
    const base=islandCamera(width,height);
    if(!state.district)return base;
    const points=spatialFeatures.filter(f=>f.district===state.district&&f.kind!=='district');if(points.length){const xs=points.map(f=>f.x),ys=points.map(f=>f.y);const view=fit({x:Math.min(...xs)-38,y:Math.min(...ys)-62,w:Math.max(...xs)-Math.min(...xs)+76,h:Math.max(...ys)-Math.min(...ys)+100},width,height);if(isMobile()&&width/view.w<2.35){const p=cityPositions[state.district],w=width/2.35,h=height/2.35;return {x:p.x-w/2,y:p.y-h/2,w,h};}return view;}const p=cityPositions[state.district],zoom=2.4;
    return {x:p.x-base.w/zoom/2,y:p.y-base.h/zoom*.56,w:base.w/zoom,h:base.h/zoom};
  }
  function buildGeometry() {
    let out='<defs>'+themes.map(t=>'<clipPath id="ea-artwork-'+t.id+'" clipPathUnits="userSpaceOnUse"><path d="'+path(t.coast)+'"/></clipPath>').join('')+'</defs>';
    themes.forEach(t=>{
      const r=t.imageRect;
      out+='<g data-land="'+t.id+'"><image href="'+esc(artwork[t.id].dataUrl)+'" x="'+r.x+'" y="'+r.y+'" width="'+r.w+'" height="'+r.h+'" preserveAspectRatio="none" clip-path="url(#ea-artwork-'+t.id+')"/></g>';
    });
    // These routes and landmarks represent the real research districts.
    // The artwork beneath them is left entirely unchanged.
    {
      themes.forEach(t=>{
        out+='<g data-city-theme="'+t.id+'">';
        const districts=districtsFor(t.id),positions=districts.map(d=>cityPositions[d.id]);
        positions.forEach((p,j)=>{
          const q=positions[(j+1)%positions.length],landmark=districts[j].works.includes(featured[t.id]);
          out+='<path d="M'+p.x+','+p.y+' Q'+((p.x+q.x)/2+t.rx*.04)+','+((p.y+q.y)/2-t.ry*.025)+' '+q.x+','+q.y+'" fill="none" stroke="'+t.color+'" stroke-opacity=".29" stroke-width=".7" vector-effect="non-scaling-stroke"/>';
          spatialFeatures.filter(f=>f.district===districts[j].id&&f.kind!=='district').forEach(f=>{
            out+='<g class="ea-city-building'+(f.kind==='tool'?' ea-city-building-software':'')+(f.featured?' ea-city-building-featured':'')+(f.comingSoon?' ea-planned-building':'')+(f.secondary?' ea-building-secondary':'')+'" data-building-district="'+f.district+'"'+(f.kind==='work'?' data-spatial-work="'+f.id+'" data-work-theme="'+f.theme+'"':'')+' transform="translate('+f.x+' '+(f.y+6)+')">'+atlasBuildingShape(f.secondary?14:18,f.secondary?9:11,f.secondary?5:6,f.featured)+'</g>';
          });
        });
        out+='</g>';
      });
    }
    svg.innerHTML=out+'<g class="ea-overlap-routes" aria-hidden="true"></g>';
    renderConnections();
  }
  function paint() {
    if(!camera||!lastWidth||!lastHeight) return;
    svg.setAttribute('viewBox',[camera.x,camera.y,camera.w,camera.h].join(' '));
    const sx=x=>(x-camera.x)/camera.w*lastWidth,sy=y=>(y-camera.y)/camera.h*lastHeight;
    cityControls.hidden=true;softwareControls.hidden=true;cityRoads.hidden=true;
    controls.querySelectorAll('.ea-node').forEach(n=>n.hidden=true);
    const scale=lastWidth/camera.w;
    const closeDetail=isMobile()?scale>=2.3:scale>=1.6;
    const mobileIslandLevel=!isMobile()||Boolean(state.island)&&camera.w<=islandCamera(lastWidth,lastHeight).w*1.25;
    root.dataset.mapDetail=closeDetail?'buildings':scale>=.8?'themes':'islands';
    spatialFeatures.forEach(f=>{
      const x=sx(f.x),y=sy(f.y),city=f.kind==='district';
      const mobileHidden=isMobile()&&(!mobileIslandLevel||f.theme!==state.island||(!city&&state.district&&f.district!==state.district));
      const inset=isMobile()?24:18;
      f.button.hidden=mobileHidden||(city?closeDetail:!closeDetail)||x<inset||x>lastWidth-inset||y<inset||y>lastHeight-inset;
      if(f.button.hidden)return;
      f.button.style.left=x+'px';f.button.style.top=y+'px';
      if(!city){f.button.style.width=(isMobile()?44:Math.min(42,Math.max(28,23*scale)))+'px';f.button.style.height=(isMobile()?44:Math.min(40,Math.max(28,19*scale)))+'px';}
      f.button.setAttribute('aria-pressed',String(city?state.district===f.id:state.kind===f.kind&&state.selected===f.id));
    });
    positionVessels();
    renderConnections();
    svg.querySelectorAll('[data-building-district]').forEach(g=>g.style.display=isMobile()&&closeDetail&&state.district&&g.dataset.buildingDistrict!==state.district?'none':'');
    themes.forEach(t=>{
      const mobileOther=isMobile()&&state.island&&t.id!==state.island;
      svg.querySelector('[data-land="'+t.id+'"]').style.display=mobileOther?'none':'';
      svg.querySelector('[data-city-theme="'+t.id+'"]').style.display=isMobile()&&(!state.island||mobileOther)?'none':'';
      const hit=controls.querySelector('.ea-island-hit[data-theme="'+t.id+'"]');
      const label=controls.querySelector('.ea-island-label[data-theme="'+t.id+'"]');
      hit.hidden=true;label.hidden=(isMobile()?(state.island?(mobileIslandLevel||t.id!==state.island):false):scale>=.8)||sx(t.x)<35||sx(t.x)>lastWidth-35||sy(t.y)<35||sy(t.y)>lastHeight-35;
      hit.style.left=sx(t.bounds.x)+'px';hit.style.top=sy(t.bounds.y)+'px';hit.style.width=t.bounds.w/camera.w*lastWidth+'px';hit.style.height=t.bounds.h/camera.h*lastHeight+'px';
      label.style.left=sx(t.x)+'px';label.style.top=sy(t.y)+'px';
    });
  }
  // Locate ships by their own coastline, in map coordinates, so pan/zoom retains association.
  function positionMobileVessels(){
    shipLayer.style.setProperty('--ship-scale','1');
    shipLayer.querySelectorAll('.ea-expedition').forEach(v=>v.hidden=true);
    if(!state.island||state.district)return;
    const t=byId(themes,state.island),own=shipsForTheme(t.id),base=islandCamera(lastWidth,lastHeight),key='mobile|'+t.id+'|'+lastWidth+'|'+lastHeight;
    if(!vesselPositionCache.has(key)){
      const coast=t.coast.map(p=>[(p[0]-base.x)/base.w*lastWidth,(p[1]-base.y)/base.h*lastHeight]);
      const candidates=[];
      for(let y=32;y<lastHeight-32;y+=14)for(let x=28;x<lastWidth-28;x+=14){
        if(x<184&&y>lastHeight-82)continue;
        if([[0,0],[-24,-28],[24,-28],[-24,28],[24,28]].some(p=>inside(x+p[0],y+p[1],coast)))continue;
        candidates.push({x,y,d:Math.min(...coast.map(p=>Math.hypot(p[0]-x,p[1]-y)))});
      }
      candidates.sort((a,b)=>a.d-b.d);const chosen=[],positions=new Map();
      for(const ship of own){const p=candidates.find(p=>chosen.every(q=>Math.abs(p.x-q.x)>=54||Math.abs(p.y-q.y)>=62));if(p){chosen.push(p);positions.set(ship.work,{x:base.x+p.x/lastWidth*base.w,y:base.y+p.y/lastHeight*base.h});}}
      vesselPositionCache.set(key,positions);
    }
    const positions=vesselPositionCache.get(key);
    own.forEach(ship=>{const p=positions.get(ship.work),v=shipLayer.querySelector('[data-expedition="'+ship.work+'"]');if(!p)return;const x=(p.x-camera.x)/camera.w*lastWidth,y=(p.y-camera.y)/camera.h*lastHeight;v.hidden=x<24||x>lastWidth-24||y<28||y>lastHeight-28;v.style.left=x+'px';v.style.top=y+'px';v.dataset.mapX=p.x;v.dataset.mapY=p.y;});
  }
  function positionVessels(){
    if(isMobile()){positionMobileVessels();return;}
    const base=fit(allBounds,lastWidth,lastHeight),key=lastWidth+'|'+lastHeight;
    const compactScale=Math.min(1,lastWidth/320);
    if(!vesselPositionCache.has(key)){
      const padX=28*compactScale*base.w/lastWidth,padY=32*compactScale*base.h/lastHeight;
      const coastDistance=(p,t)=>Math.min(...t.coast.map(q=>Math.hypot(p.x-q[0],p.y-q[1])));
      const candidatesFor=theme=>{
        const candidates=[];
        const step=Math.max(1,Math.floor(theme.coast.length/72));
        for(let i=0;i<theme.coast.length;i+=step){
          const coast=theme.coast[i],dx=coast[0]-theme.x,dy=coast[1]-theme.y,length=Math.hypot(dx,dy);
          for(const offset of [1.05,1.5,2,2.5,3].map(n=>Math.max(padX,padY)*n)){
            const p={x:coast[0]+dx/length*offset,y:coast[1]+dy/length*offset};
            const fits=!themes.some(t=>[[0,0],[-padX,-padY],[padX,-padY],[-padX,padY],[padX,padY]].some(o=>inside(p.x+o[0],p.y+o[1],t.coast)));
            const homeDistance=coastDistance(p,theme);
            const nearestHome=themes.every(t=>t===theme||coastDistance(p,t)>=homeDistance);
            if(fits&&nearestHome&&p.x>base.x+padX&&p.x<base.x+base.w-padX&&p.y>base.y+padY&&p.y<base.y+base.h-padY)candidates.push({...p,d:offset+Math.hypot(p.x-theme.x,p.y-theme.y)*.05});
          }
        }
        return candidates.sort((a,b)=>a.d-b.d);
      };
      const harbors=themes.filter(t=>shipsForTheme(t.id).length).map(t=>({theme:t,candidates:candidatesFor(t),ships:shipsForTheme(t.id)}));
      // Give constrained harbors first choice, and reserve room for each ship.
      harbors.sort((a,b)=>a.candidates.length/a.ships.length-b.candidates.length/b.ships.length);
      const occupied=[],positions=new Map();
      const separate=(p,q)=>Math.abs(p.x-q.x)>=padX*2||Math.abs(p.y-q.y)>=padY*2;
      const pack=(candidates,count)=>{
        if(!count)return [];
        for(let i=0;i<=candidates.length-count;i++){
          const p=candidates[i],rest=pack(candidates.slice(i+1).filter(q=>separate(p,q)),count-1);
          if(rest)return [p,...rest];
        }
        return null;
      };
      for(const harbor of harbors){
        const available=harbor.candidates.filter(p=>occupied.every(q=>separate(p,q)));
        let berth=[];
        for(let count=harbor.ships.length;count>0;count--){const candidate=pack(available,count);if(candidate){berth=candidate;break;}}
        harbor.ships.forEach((ship,i)=>{if(berth[i]){positions.set(ship.work,berth[i]);occupied.push(berth[i]);}});
      }
      vesselPositionCache.set(key,positions);
    }
    shipLayer.style.setProperty('--ship-scale',compactScale*Math.min(1.2,base.w/camera.w));
    ships.forEach(ship=>{
      const vessel=shipLayer.querySelector('[data-expedition="'+ship.work+'"]');
      const p=vesselPositionCache.get(key).get(ship.work);vessel.hidden=!p;
      if(p){const x=(p.x-camera.x)/camera.w*lastWidth,y=(p.y-camera.y)/camera.h*lastHeight;vessel.hidden=x<0||x>lastWidth||y<0||y>lastHeight||(isMobile()&&(!state.island||ship.theme!==state.island||Boolean(state.district)));vessel.style.left=x+'px';vessel.style.top=y+'px';vessel.dataset.mapX=p.x;vessel.dataset.mapY=p.y;}
    });
  }
  function renderConnections(){
    const id=hoveredWork||(state.kind==='work'?state.selected:null);
    const marks=id?spatialFeatures.filter(f=>f.kind==='work'&&f.id===id):[];
    const home=marks.find(f=>f.theme===(hoveredWork?hoveredTheme:state.island))||marks.find(f=>!f.secondary)||marks[0];
    svg.querySelectorAll('[data-spatial-work]').forEach(mark=>mark.classList.toggle('ea-work-highlight',mark.dataset.spatialWork===id));
    spatialFeatures.forEach(f=>f.button.classList.toggle('ea-work-highlight',f.kind==='work'&&f.id===id));
    const layer=svg.querySelector('.ea-overlap-routes');if(!layer)return;
    const labelBoxes=[];
    layer.innerHTML=home?marks.filter(f=>f!==home).map(f=>{
      const control={x:(home.x+f.x)/2,y:Math.min(home.y,f.y)-Math.abs(home.x-f.x)*.12-55};
      return '<path data-connection-work="'+id+'" d="M'+home.x+','+home.y+' Q'+control.x+','+control.y+' '+f.x+','+f.y+'"/><circle cx="'+f.x+'" cy="'+f.y+'" r="13"/>'+connectionLabel(home,control,f,labelBoxes);
    }).join(''):'';
  }
  function connectionLabel(start,control,end,occupied){
    if(!camera||!lastWidth)return '';
    const title=byId(themes,end.theme).title,unit=camera.w/lastWidth;
    const width=Math.min(lastWidth-28,title.length*7.4+26),height=30;
    const curve=t=>({x:(1-t)*(1-t)*start.x+2*(1-t)*t*control.x+t*t*end.x,y:(1-t)*(1-t)*start.y+2*(1-t)*t*control.y+t*t*end.y});
    const visible=[];
    for(let i=0;i<=120;i++){
      const p=curve(i/120),x=(p.x-camera.x)/unit,y=(p.y-camera.y)/unit;
      if(x>=12&&x<=lastWidth-12&&y>=12&&y<=lastHeight-12)visible.push({p,x,y});
    }
    if(!visible.length)return '';
    const choices=[.82,.57,.32,.96].map(fraction=>{
      const point=visible[Math.floor((visible.length-1)*fraction)];
      const x=Math.max(width/2+14,Math.min(lastWidth-width/2-14,point.x));
      const y=Math.max(height/2+14,Math.min(lastHeight-height/2-14,point.y));
      const box={left:x-width/2,right:x+width/2,top:y-height/2,bottom:y+height/2};
      const collisions=occupied.filter(b=>box.left<b.right+8&&box.right>b.left-8&&box.top<b.bottom+8&&box.bottom>b.top-8).length;
      return {point,x,y,box,collisions};
    });
    choices.sort((a,b)=>a.collisions-b.collisions);const choice=choices[0];occupied.push(choice.box);
    const x=camera.x+choice.x*unit,y=camera.y+choice.y*unit;
    return '<g class="ea-route-label" data-route-destination="'+end.theme+'" data-screen-x="'+choice.x+'" data-screen-y="'+choice.y+'" data-label-width="'+width+'"><path class="ea-route-label-leader" d="M'+choice.point.p.x+','+choice.point.p.y+' L'+x+','+y+'"/><rect x="'+(x-width*unit/2)+'" y="'+(y-height*unit/2)+'" width="'+width*unit+'" height="'+height*unit+'" rx="'+4*unit+'"/><text x="'+x+'" y="'+(y+4.5*unit)+'" text-anchor="middle" font-size="'+14*unit+'">'+esc(title)+'</text></g>';
  }
  function zoomAt(factor,x=.5,y=.5){
    if(!camera)return;
    cancelAnimationFrame(frame);
    const atlas=fit(allBounds,lastWidth,lastHeight);
    const width=Math.max(lastWidth/3.6,Math.min(atlas.w*1.5,camera.w*factor));
    const scale=width/camera.w,height=camera.h*scale;
    camera={x:camera.x+(camera.w-width)*x,y:camera.y+(camera.h-height)*y,w:width,h:height};
    paint();
  }
  map.addEventListener('wheel',event=>{
    if(!camera)return;
    event.preventDefault();
    const bounds=map.getBoundingClientRect();
    const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?lastHeight:1);
    zoomAt(Math.exp(Math.max(-200,Math.min(200,delta))*.0018),(event.clientX-bounds.left)/bounds.width,(event.clientY-bounds.top)/bounds.height);
  },{passive:false});
  let drag=null,lastPanEnd=-Infinity;
  const touches=new Map();let touchGesture=null;
  const touchMid=()=>{const values=[...touches.values()];return {x:values.reduce((n,p)=>n+p.x,0)/values.length,y:values.reduce((n,p)=>n+p.y,0)/values.length,d:values.length>1?Math.hypot(values[0].x-values[1].x,values[0].y-values[1].y):0};};
  const startTouch=()=>{touchGesture=touches.size?{...touchMid(),camera:{...camera},moved:false}:null;};
  map.addEventListener('pointerdown',event=>{
    if(event.pointerType==='touch'&&isMobile()&&expanded&&camera&&!event.target.closest('.ea-map-zoom')){
      cancelAnimationFrame(frame);touches.set(event.pointerId,{x:event.clientX,y:event.clientY});startTouch();return;
    }
    if(event.button!==0||event.pointerType!=='mouse'||event.target.closest('button')||!camera)return;
    cancelAnimationFrame(frame);drag={x:event.clientX,y:event.clientY,camera:{...camera}};
    map.setPointerCapture(event.pointerId);map.dataset.dragging='true';event.preventDefault();
  });
  map.addEventListener('pointermove',event=>{
    if(touches.has(event.pointerId)&&touchGesture){
      touches.set(event.pointerId,{x:event.clientX,y:event.clientY});const current=touchMid(),origin=touchGesture,b=map.getBoundingClientRect();
      if(Math.hypot(current.x-origin.x,current.y-origin.y)>4||Math.abs(current.d-origin.d)>4)origin.moved=true;
      if(origin.moved){event.preventDefault();if(!map.hasPointerCapture(event.pointerId))map.setPointerCapture(event.pointerId);const ratio=origin.d&&current.d?origin.d/current.d:1,atlas=fit(allBounds,lastWidth,lastHeight),w=Math.max(lastWidth/5,Math.min(atlas.w*1.5,origin.camera.w*ratio)),h=w*lastHeight/lastWidth;camera={x:origin.camera.x+(origin.x-b.left)/lastWidth*origin.camera.w-(current.x-b.left)/lastWidth*w,y:origin.camera.y+(origin.y-b.top)/lastHeight*origin.camera.h-(current.y-b.top)/lastHeight*h,w,h};paint();lastPanEnd=performance.now();}return;
    }
    if(!drag)return;
    if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>4)drag.moved=true;
    camera={...drag.camera,x:drag.camera.x-(event.clientX-drag.x)/lastWidth*drag.camera.w,y:drag.camera.y-(event.clientY-drag.y)/lastHeight*drag.camera.h};paint();
  });
  const endPan=()=>{if(drag&&drag.moved)lastPanEnd=performance.now();drag=null;delete map.dataset.dragging;};
  const endTouch=event=>{if(event.type==='lostpointercapture'&&event.target!==map)return;if(touches.has(event.pointerId)){const moved=touchGesture?.moved||touches.size>1;if(moved)lastPanEnd=performance.now();touches.delete(event.pointerId);startTouch();}endPan();};
  map.addEventListener('pointerup',endTouch);map.addEventListener('pointercancel',endTouch);map.addEventListener('lostpointercapture',endTouch);
  map.addEventListener('click',event=>{
    if(event.target.closest('button')||!camera||performance.now()-lastPanEnd<200)return;
    const b=map.getBoundingClientRect(),x=camera.x+(event.clientX-b.left)/b.width*camera.w,y=camera.y+(event.clientY-b.top)/b.height*camera.h;
    const island=themes.find(t=>inside(x,y,t.coast));
    if(island)select('theme',island.id);
  });
  function drawMap(animate=false) {
    const width=map.clientWidth,height=map.clientHeight;
    if(!width||!height) return;
    const resized=width!==lastWidth||height!==lastHeight;
    lastWidth=width;lastHeight=height;
    if(layoutColumns!==(width<620?2:3)){
      arrangeIslands();spatialFeatures=makeSpatialFeatures();
      cityPackingCache.clear();vesselPositionCache.clear();geometryKey='';camera=null;
    }
    const key=state.island||'all';
    if(key!==geometryKey){buildGeometry();geometryKey=key;}
    const target=targetCamera(width,height);
    const nextPositions=packedPositions(target,width,height);
    const finalLabels=root.dataset.pinLabels;
    cancelAnimationFrame(frame);
    if(!camera||!animate||resized||reduced()) {camera=target;nodePositions=nextPositions;paint();return;}
    root.dataset.pinLabels='false';
    const start={...camera},oldPositions={...nodePositions},started=performance.now();
    const step=now=>{
      const progress=Math.min(1,(now-started)/760),ease=1-Math.pow(1-progress,4);
      camera={};['x','y','w','h'].forEach(k=>camera[k]=start[k]+(target[k]-start[k])*ease);
      nodePositions={};
      Object.keys(nextPositions).forEach(id=>{
        const a=oldPositions[id]||nextPositions[id],b=nextPositions[id];
        nodePositions[id]={x:a.x+(b.x-a.x)*ease,y:a.y+(b.y-a.y)*ease};
      });
      if(progress===1)root.dataset.pinLabels=finalLabels;
      paint();if(progress<1) frame=requestAnimationFrame(step);
    };
    frame=requestAnimationFrame(step);
  }
  function renderList() {
    if(state.island) {
      const t=byId(themes,state.island);
      const groups=state.district?[byId(allDistricts,state.district)]:districtsFor(t.id);
      const title=state.district?byId(allDistricts,state.district).title:t.title;
      const rows=groups.map(d=>'<div class="ea-list-group" style="--tone:'+t.color+'"><h3 class="ea-list-group-title"><button type="button" data-district="'+d.id+'">'+esc(d.title)+' · '+districtCount(d)+' ↗</button></h3>'+toolsForDistrict(d.id).map(toolRow).join('')+districtWorks(d.id).map(workRow).join('')+'</div>').join('');
      list.innerHTML=rows;
      index.innerHTML='<div class="ea-index-heading"><h2>'+esc(title)+'</h2><span>'+ (state.district?districtCount(byId(allDistricts,state.district)):themeCount(t.id))+'</span></div>'+rows+(state.district?'<button type="button" class="ea-back" data-action="island">← All work on '+esc(t.title)+'</button>':'');
    } else {
      list.innerHTML=themes.map(t=>'<div class="ea-list-group" style="--tone:'+t.color+'"><h3 class="ea-list-group-title"><button type="button" data-theme="'+t.id+'">'+esc(t.title)+' · '+themeCount(t.id)+' ↗</button></h3>'+toolsForTheme(t.id).map(toolRow).join('')+t.papers.map(workRow).join('')+'</div>').join('');
    }
  }
  function renderPanel() {
    root.dataset.overview=String(state.kind==='overview');
    let html='';
    close.hidden=state.kind==='overview';
    close.setAttribute('aria-label',state.kind==='work'?'Return to this research theme':state.kind==='district'?'Return to this island':'Return to research overview');
    if(state.kind==='theme') {
      const t=byId(themes,state.island);
      kicker.textContent=t.index+' / '+themeCount(t.id);
      html='<h2 class="ea-panel-title" data-tooltip="'+esc('Main focus: '+t.description)+'">'+esc(t.title)+'</h2><p class="ea-panel-desc">'+esc(t.question)+'</p>';

      html+=section('Explore '+districtsFor(t.id).length+' themes',districtsFor(t.id).map(districtItem).join(''));
      if(toolsForTheme(t.id).length)html+=section('Related software',toolsForTheme(t.id).map(toolItem).join(''));
      const landmark=byId(works,featured[t.id]);
      html+=section('Featured work','<button type="button" class="ea-panel-item ea-featured" data-work="'+landmark.id+'" data-featured="true"><span class="ea-item-name">'+esc(landmark.title)+citation(landmark)+'<span class="ea-item-meta">'+esc(featuredWhy[t.id])+'</span></span><span aria-hidden="true">↗</span></button>');
      if(shipsForTheme(t.id).length)html+=section('Work in progress',shipsForTheme(t.id).map(shipItem).join(''));
      html+='<button type="button" class="ea-panel-item" data-action="index"><span class="ea-item-name">Browse all '+t.papers.length+' outputs</span><span aria-hidden="true">↓</span></button>';
      const shared=t.papers.filter(w=>w.themes.length>1).length;
      html+='<p class="ea-small-copy">'+shared+' outputs also appear on other islands.</p>';
    } else if(state.kind==='district') {
      const d=byId(allDistricts,state.district),t=byId(themes,state.island);
      kicker.textContent=t.title+' / '+districtCount(d);
      html='<h2 class="ea-panel-title">'+esc(d.title)+'</h2><p class="ea-panel-desc">'+esc(d.shortDescription)+'</p>';
      if(currentTools().length)html+=section('Related software',currentTools().map(toolItem).join(''));
      if(currentWorks().length)html+=section('Research outputs',currentWorks().map(item).join(''));
      html+='<button type="button" class="ea-panel-item" data-action="island"><span class="ea-item-name">← All research themes on '+esc(t.title)+'</span></button>';
    } else if(state.kind==='work') {
      const w=byId(works,state.selected);
      kicker.textContent=(w.isShip?'Work in progress / ':'')+w.year+' / '+w.typeLabel;
      html='<h2 class="ea-panel-title">'+esc(w.short)+'</h2>'+(w.takeaway?'<p class="ea-panel-desc">'+esc(w.takeaway)+'</p>':'');
      if(isFeatured(w))html+='<p class="ea-featured-label">Featured work · An editorial starting point</p>';
      html+=section(w.typeLabel,'<p class="ea-exact-title">'+esc(w.title)+'</p>'+citation(w)+'<a class="ea-open-link" href="research/'+w.id+'/">Full record &amp; source links ↗</a>');
      html+=scienceBadges(w);if(w.url)html+=openLink(w.url,'Open source');
      if(w.componentCount)html+='<p class="ea-small-copy">'+w.componentCount+' associated version'+(w.componentCount>1?'s':'')+' or material'+(w.componentCount>1?'s':'')+' included in this record.</p>';
      else if(w.versions&&w.versions.length)html+='<p class="ea-small-copy">'+w.versions.length+' earlier version'+(w.versions.length>1?'s':'')+' linked in this record.</p>';
      html+=themeLinks(w.themes,w.isShip?null:w.id);
      html+='<p class="ea-small-copy">Home island: '+esc(byId(themes,w.primary).title)+'.</p>';
      html+='<button type="button" class="ea-panel-item" data-action="parent"><span class="ea-item-name">← '+esc(state.district?byId(allDistricts,state.district).title:byId(themes,state.island).title)+'</span></button>';
    } else if(state.kind==='tool') {
      const t=byId(tools,state.selected);
      kicker.textContent='Tool / '+t.status;
      html='<h2 class="ea-panel-title">'+esc(t.title)+'</h2><p class="ea-tool-history">'+esc(toolHistory(t))+'</p><p class="ea-panel-desc">'+esc(t.description)+'</p><p class="ea-small-copy">'+esc(t.detail)+'</p>'+(t.url?openLink(t.url,t.link):'')+themeLinks(t.themes);
      if(state.district&&currentWorks().length)html+=section('Related research',currentWorks().slice(0,3).map(item).join(''));
    } else if(state.kind==='tools') {
      kicker.textContent='Tools / Research practice';
      html='<h2 class="ea-panel-title">Ideas into<br>useful tools.</h2><p class="ea-panel-desc">Discover literature. Inspect evidence. Make time to write.</p>';
      html+=section('Explore a tool',tools.map(toolItem).join(''));
    } else if(state.kind==='about') {
      kicker.textContent='About / Colby Vorland';
      html+=section('At Indiana University','<p class="ea-exact-title">Assistant Research Scientist<br>Epidemiology and Biostatistics<br>School of Public Health–Bloomington</p>');
      html+='<p class="ea-small-copy">Statistical reanalysis, reporting transparency, and semi-automated tools. Nutrition, obesity, and aging are major application areas.</p>'+openLink('https://publichealth.indiana.edu/about/directory/Colby-Vorland-cvorland.html','University profile');
      html+=section('Contact','<a class="ea-open-link" href="mailto:cvorland@iu.edu">cvorland@iu.edu</a>');
    } else {
      kicker.textContent='Overview / '+works.length+' research outputs · '+tools.length+' tools';
      html='<h2 class="ea-panel-title">Explore the research.</h2>';
      html+=section('Research themes',themes.map(t=>'<button type="button" class="ea-panel-item" data-theme="'+t.id+'"><span class="ea-item-index">'+t.index+'</span><span class="ea-item-name">'+esc(t.title)+'<span class="ea-item-meta">'+themeCount(t.id)+'</span></span><span aria-hidden="true">↗</span></button>').join(''));
      html+='<p class="ea-small-copy">Publications and software, connected by research theme. Island areas reflect primary paper counts.</p>';
      if(ships.length)html+=section('Work in progress','<p class="ea-small-copy">'+ships.length+' ships carry standalone conference abstracts, posters, and manually selected work. Hover or select a ship to explore its evidence.</p>'+themes.filter(t=>shipsForTheme(t.id).length).map(t=>'<button type="button" class="ea-panel-item" data-theme="'+t.id+'"><span class="ea-item-name">'+esc(t.title)+'<span class="ea-item-meta">'+shipsForTheme(t.id).length+' ships</span></span><span aria-hidden="true">↗</span></button>').join(''));
    }
    panel.innerHTML=html;
  }
  function statusText() {
    if(state.kind==='work'){const w=byId(works,state.selected);return (w.isShip?'Work in progress. ':'')+w.title+'. Details and source link available.';}
    if(state.kind==='tool')return byId(tools,state.selected).title+' selected.';
    if(state.kind==='tools')return 'Tools selected. Lazy Scholar, MAARVIN.ai, I Should Be Writing, and metaresearch.ai.';
    if(state.kind==='about')return 'About Colby Vorland selected.';
    if(state.district)return byId(allDistricts,state.district).title+'. '+districtCount(byId(allDistricts,state.district))+'. All items are available on the map and in the index.';
    if(state.island)return byId(themes,state.island).title+'. '+districtsFor(state.island).length+' themes and '+currentWorks().length+' outputs. Select a research theme to explore.';
    return 'Research map. '+works.length+' works across overlapping research themes.';
  }
  function renderSelection(animate=false) {
    root.dataset.island=String(Boolean(state.island));
    root.dataset.hasPapers=String(!state.district||currentWorks().length>0);
    root.dataset.district=String(Boolean(state.district));
    root.querySelectorAll('[data-district]').forEach(b=>b.setAttribute('aria-pressed',String(state.district===b.dataset.district)));
    root.querySelectorAll('[data-theme]').forEach(b=>b.setAttribute('aria-pressed',String(state.island===b.dataset.theme)));
    root.querySelectorAll('[data-work]').forEach(b=>b.setAttribute('aria-pressed',String(state.kind==='work'&&state.selected===b.dataset.work)));
    root.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',String(state.kind==='tool'&&state.selected===b.dataset.tool)));
    root.querySelectorAll('[data-nav]').forEach(b=>b.setAttribute('aria-pressed',String(state.nav===b.dataset.nav)));
    root.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(state.view===b.dataset.view)));
    root.querySelector('#ea-map-wrap').hidden=state.view!=='map';list.hidden=state.view!=='list';
    index.hidden=!state.island||state.view!=='map';
    back.disabled=!state.island&&state.kind==='overview';
    back.hidden=!state.island;
    back.textContent='← All islands';
    if(up){up.hidden=state.kind==='overview';up.textContent=state.kind==='work'||state.kind==='tool'?'← Research theme':state.kind==='expedition'||state.district?'← Island':'← Overview';}
    zoomLabel.hidden=!state.island;
    if(state.island){const t=byId(themes,state.island);zoomLabel.style.setProperty('--tone',t.color);zoomLabel.innerHTML='<span>'+esc(t.title)+' / '+(state.district?districtCount(byId(allDistricts,state.district)):districtsFor(t.id).length+' themes')+'</span><strong>'+esc(state.district?byId(allDistricts,state.district).title:t.title)+'</strong>';}
    renderMobile();
    resetPreview();
    drawMap(animate);
  }
  function select(kind,id,options={}) {
    const mobileDetail=isMobile()&&['work','expedition','tool','tools','about'].includes(kind);
    if(mobileDetail&&!sheet.open&&!mobileOrigin)rememberMobileOrigin();
    if(isMobile()&&sheet.open&&!mobileDetail)closeMobileSheet(false);
    if(kind==='expedition'){const ship=ships.find(s=>s.work===id)||ships[0];if(ship){kind='work';id=ship.work;state.island=ship.theme;state.district=null;options.preserveCamera=true;}}
    hoveredWork=null;hoveredTheme=null;
    const savedCamera=options.preserveCamera&&camera?{...camera}:null;
    const previousPlace=state.island+'|'+state.district;
    if(kind==='theme'){state.island=id;state.district=null;state.view='map';}
    if(kind==='tool'){
      const t=byId(tools,id);
      if(!state.island||!softwareHomes[id][state.island])state.island='automation';
      state.district=softwareHomes[id][state.island];state.view='map';
    }
    if(kind==='district'){const d=byId(allDistricts,id);state.island=d.theme;state.district=id;state.view='map';}
    if(kind==='work'){
      const w=byId(works,id);
      if(!state.island||!w.themes.includes(state.island))state.island=w.primary;
      state.district=w.isShip?null:districtForWork(state.island,id)?.id||null;
    }
    if(kind==='overview'){state.island=null;state.district=null;}
    state.kind=kind;state.selected=id||null;
    state.nav=kind==='tool'||kind==='tools'?'tools':kind==='about'?'about':'research';
    renderList();renderPanel();renderSelection(!savedCamera&&previousPlace!==state.island+'|'+state.district);
    if(!isMobile())inspector.scrollTo({top:0,behavior:'instant'});
    if(savedCamera){cancelAnimationFrame(frame);camera=savedCamera;paint();}
    live.textContent=statusText();
    if(mobileDetail)openMobileSheet();
  }
  // Mobile keeps the current browsing location behind a native, focus-contained sheet.
  function rememberMobileOrigin(){
    mobileOrigin={state:{...state},camera:camera?{...camera}:null,listScroll:list.scrollTop,explorerScroll:explorer.scrollTop};
    if(!mobileTrigger)mobileTrigger=document.activeElement;
    // Lock before selecting a work can replace a long, document-scrolled list.
    syncBodyLock(true);
  }
  function syncBodyLock(force=false){
    const locked=isMobile()&&(force||expanded||sheet.open);
    if(locked&&!bodyLock){
      bodyLock={x:scrollX,y:scrollY,position:document.body.style.position,top:document.body.style.top,left:document.body.style.left,width:document.body.style.width,overflow:document.body.style.overflow};
      Object.assign(document.body.style,{position:'fixed',top:-bodyLock.y+'px',left:-bodyLock.x+'px',width:'100%',overflow:'hidden'});
    }else if(!locked&&bodyLock){
      const saved=bodyLock;bodyLock=null;
      Object.assign(document.body.style,{position:saved.position,top:saved.top,left:saved.left,width:saved.width,overflow:saved.overflow});
      window.scrollTo({left:saved.x,top:saved.y,behavior:'instant'});
    }
  }
  function openMobileSheet(){
    dismissTooltip();
    if(!sheet.open){sheet.dataset.size='peek';sheet.querySelector('[data-mobile-action=sheet-size]').textContent='Expand details ↑';sheet.querySelector('[data-mobile-action=sheet-size]').setAttribute('aria-expanded','false');sheet.showModal();syncBodyLock();}
    inspector.scrollTop=0;
    sheet.querySelector('[data-mobile-action=dismiss]').focus({preventScroll:true});
  }
  function restoreMobileFocus(trigger){
    const usable=b=>b&&b.isConnected&&b.getClientRects().length&&!b.closest('[hidden]')&&!b.closest('dialog:not([open])');
    let candidate=trigger;
    if(!usable(candidate)&&trigger?.dataset){
      const d=trigger.dataset;
      if(d.spatialId)candidate=[...spatialLayer.querySelectorAll('[data-spatial-id]')].find(b=>b.dataset.spatialId===d.spatialId&&b.dataset.homeTheme===d.homeTheme);
      else if(d.work)candidate=[...root.querySelectorAll('[data-work]')].find(b=>b.dataset.work===d.work&&usable(b));
      else if(d.expedition)candidate=[...root.querySelectorAll('[data-expedition]')].find(b=>b.dataset.expedition===d.expedition&&usable(b));
    }
    (usable(candidate)?candidate:islandSelect).focus({preventScroll:true});
  }
  function closeMobileSheet(restore=true){
    if(!sheet.open&&!mobileOrigin)return;
    const origin=mobileOrigin,trigger=mobileTrigger;mobileOrigin=null;mobileTrigger=null;
    if(sheet.open)sheet.close();
    if(restore&&origin){Object.assign(state,origin.state);renderList();renderPanel();renderSelection();if(origin.camera){cancelAnimationFrame(frame);camera=origin.camera;paint();}list.scrollTop=origin.listScroll;explorer.scrollTop=origin.explorerScroll;}
    syncBodyLock();
    if(restore)requestAnimationFrame(()=>restoreMobileFocus(trigger));
  }
  function setExpanded(value){
    if(value===expanded)return;
    if(value)syncBodyLock(true);
    expanded=value;root.dataset.expanded=String(value);touches.clear();touchGesture=null;
    if(value){explorer.setAttribute('role','dialog');explorer.setAttribute('aria-modal','true');explorer.setAttribute('aria-label','Expanded research map');}
    else{explorer.removeAttribute('role');explorer.removeAttribute('aria-modal');explorer.setAttribute('aria-label','Explore research');}
    root.querySelectorAll('.ea-chrome,.ea-hero,.ea-mobile-software,.ea-footer,.ea-island-index,.skip-link').forEach(e=>e.inert=value);
    syncBodyLock();renderMobile();drawMap();
    const target=!value&&state.view==='list'?root.querySelector('[data-view=list]'):root.querySelector('[data-mobile-action='+ (value?'exit':'expand') +']');
    if(isMobile())target.focus({preventScroll:true});
  }
  function renderMobile(){
    if(!isMobile())return;
    const t=state.island?byId(themes,state.island):null,d=state.district?byId(allDistricts,state.district):null;
    islandSelect.value=state.island||'';
    root.querySelector('.ea-mobile-title').textContent=d?d.title:t?t.title:'Explore the islands';
    root.querySelector('.ea-mobile-focus').textContent=d?d.shortDescription:t?t.description:'Choose an island to explore its research. Island area reflects the number of primary papers.';
    root.querySelector('[data-mobile-action=expand]').hidden=expanded||state.view!=='map';
    root.querySelector('[data-mobile-action=exit]').hidden=!expanded;
    mobileCities.hidden=!t||state.view!=='map'||expanded;
    up.hidden=!d;
    const markup=t?districtsFor(t.id).map(city=>'<button type="button" data-district="'+city.id+'" aria-pressed="'+(state.district===city.id)+'">'+esc(city.title)+'<small>'+districtCount(city)+'</small></button>').join('')+'<div class="ea-mobile-work-links"><button type="button" data-mobile-action="browse">Browse '+(d?'this theme':'island')+' in List →</button><button type="button" data-work="'+featured[t.id]+'">✦ Featured work</button>'+(shipsForTheme(t.id).length?'<button type="button" data-mobile-action="ships">Work in progress · '+shipsForTheme(t.id).length+' ships</button>':'')+'</div>':'';
    // Preserve the activated city button between identical renders.
    if(mobileCities.dataset.markup!==markup){mobileCities.innerHTML=markup;mobileCities.dataset.markup=markup;}
  }
  let inspectorFrame=0;
  function fitInspector(){
    cancelAnimationFrame(inspectorFrame);
    inspectorFrame=requestAnimationFrame(()=>{
      if(isMobile()){inspector.style.removeProperty('--ea-panel-height');return;}
      const top=Math.max(16,inspector.getBoundingClientRect().top);
      inspector.style.setProperty('--ea-panel-height',Math.max(0,window.innerHeight-top-16)+'px');
    });
  }
  window.addEventListener('scroll',fitInspector,{passive:true});
  window.addEventListener('resize',fitInspector);
  inspector.addEventListener('scroll',dismissTooltip,{passive:true});
  if(document.fonts)document.fonts.ready.then(fitInspector);
  function configureMobile(){
    root.dataset.mobile=String(isMobile());
    inspector.tabIndex=isMobile()?-1:0;
    mobileContext.hidden=!isMobile();mobileSoftware.hidden=!isMobile();
    if(isMobile()){sheet.append(inspector);renderMobile();}
    else{
      closeMobileSheet(false);setExpanded(false);inspectorHome.append(inspector);syncBodyLock();
      mobileCities.hidden=true;root.querySelectorAll('.ea-mobile-control').forEach(b=>b.hidden=true);
    }
    dismissTooltip();renderList();renderPanel();renderSelection();fitInspector();
  }
  islandSelect.addEventListener('change',()=>select(islandSelect.value?'theme':'overview',islandSelect.value||undefined));
  sheet.addEventListener('cancel',event=>{event.preventDefault();closeMobileSheet();});
  sheet.addEventListener('click',event=>{if(event.target===sheet){const b=sheet.getBoundingClientRect();if(event.clientY<b.top||event.clientX<b.left||event.clientX>b.right)closeMobileSheet();}});
  root.addEventListener('click',event=>{
    if(event.target.closest('.ea-map')&&performance.now()-lastPanEnd<400){event.preventDefault();event.stopImmediatePropagation();return;}
    if(!isMobile())return;
    const b=event.target.closest('button');if(!b)return;
    if(!sheet.open)mobileTrigger=b;
    if(!sheet.open&&(b.dataset.work||b.dataset.tool||b.dataset.expedition||['work','tool'].includes(b.dataset.spatialType)))rememberMobileOrigin();
    if(!b.dataset.mobileAction)return;
    event.preventDefault();event.stopImmediatePropagation();
    switch(b.dataset.mobileAction){
      case 'expand':setExpanded(true);break;
      case 'exit':setExpanded(false);break;
      case 'dismiss':closeMobileSheet();break;
      case 'sheet-size':{const full=sheet.dataset.size!=='full';sheet.dataset.size=full?'full':'peek';b.textContent=full?'Reduce details ↓':'Expand details ↑';b.setAttribute('aria-expanded',String(full));break;}
      case 'browse':state.view='list';renderSelection();break;
      case 'ships':rememberMobileOrigin();kicker.textContent='Work in progress';panel.innerHTML='<h2 class="ea-panel-title">'+esc(byId(themes,state.island).title)+'</h2>'+shipsForTheme(state.island).map(shipItem).join('');openMobileSheet();break;
    }
  },true);
  root.addEventListener('keydown',event=>{
    if(!isMobile())return;
    if(sheet.open){
      if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();closeMobileSheet();}
      if(event.key==='Tab'){
        const candidates=[...sheet.querySelectorAll('button,a[href],input,select,[tabindex="0"]')].filter(e=>!e.disabled&&e.getClientRects().length&&!e.closest('[hidden]'));
        const first=candidates[0],last=candidates[candidates.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
      }return;
    }
    if(!expanded)return;
    if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();setExpanded(false);}
    if(event.key==='Tab'){
      const candidates=[...explorer.querySelectorAll('button,select,a[href],input,[tabindex="0"]')].filter(e=>!e.disabled&&e.getClientRects().length&&!e.closest('[hidden]'));
      const first=candidates[0],last=candidates[candidates.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    }
  },true);
  mobileQuery.addEventListener('change',configureMobile);
  function focusIsland(id) {
    const button=state.view==='list'?list.querySelector('[data-theme="'+id+'"]'):controls.querySelector('.ea-island-label[data-theme="'+id+'"]');
    if(button&&!button.hidden)button.focus({preventScroll:true});else back.focus({preventScroll:true});
  }
  function returnOverview() {
    const previous=state.island;select('overview');
    if(previous)requestAnimationFrame(()=>focusIsland(previous));
    else root.querySelector('.ea-nav a').focus({preventScroll:true});
  }
  function returnIsland() {
    const previous=state.district;
    if(state.island){select('theme',state.island);requestAnimationFrame(()=>{
      const target=previous&&spatialLayer.querySelector('[data-spatial-type="district"][data-spatial-id="'+previous+'"]');
      if(target&&!target.hidden&&!target.closest('[hidden]'))target.focus({preventScroll:true});else back.focus({preventScroll:true});
    });}
    else returnOverview();
  }
  function returnParent() {
    if(state.kind==='work'&&byId(works,state.selected).isShip){returnIsland();return;}
    if(state.kind==='work'&&state.district){const previous=state.selected;select('district',state.district);requestAnimationFrame(()=>{
      const target=spatialLayer.querySelector('[data-spatial-type="work"][data-spatial-id="'+previous+'"][data-home-theme="'+state.island+'"]');
      if(target&&!target.hidden&&!target.closest('[hidden]'))target.focus({preventScroll:true});else (up||back).focus({preventScroll:true});
    });}
    else if(state.kind==='district'||state.kind==='expedition')returnIsland();
    else if(state.kind==='tool'||state.kind==='tools'||state.kind==='about'){
      if(state.district){select('district',state.district);(up||back).focus({preventScroll:true});}
      else if(state.island)returnIsland();else returnOverview();
    }
    else if(state.island)returnOverview();else returnOverview();
  }
  root.addEventListener('click',event=>{
    const contact=event.target.closest('[data-open-about]');
    if(contact&&root.contains(contact)){
      event.preventDefault();
      select('about');
      panel.querySelector('a[href^="mailto:"]').focus({preventScroll:true});
      root.querySelector('.ea-inspector').scrollIntoView({block:'start',behavior:reduced()?'auto':'smooth'});
      return;
    }
    const button=event.target.closest('button');
    if(!button||!root.contains(button))return;
    if(button.dataset.locateWork){
      if(isMobile()){
        closeMobileSheet(false);state.island=button.dataset.locateTheme;state.district=districtForWork(state.island,button.dataset.locateWork)?.id||null;state.kind=state.district?'district':'theme';state.selected=state.district||state.island;
        renderList();renderPanel();renderSelection();rememberMobileOrigin();select('work',button.dataset.locateWork);
      }else{state.island=button.dataset.locateTheme;select('work',button.dataset.locateWork);close.focus({preventScroll:true});}return;
    }
    if(button.dataset.spatialType){
      state.island=button.dataset.homeTheme;state.district=button.dataset.homeDistrict;
      select(button.dataset.spatialType,button.dataset.spatialId,{preserveCamera:!(isMobile()&&button.dataset.spatialType==='district')});
      return;
    }
    if(button.dataset.zoom){
      if(button.dataset.zoom==='fit')drawMap(true);else zoomAt(button.dataset.zoom==='in'?.8:1.25);
      live.textContent=button.dataset.zoom==='fit'?'Map fitted to the current view.':'Map zoom adjusted.';
      return;
    }
    const inPanel=panel.contains(button),inList=list.contains(button),inIndex=index.contains(button);
    if(button.dataset.expedition){select('expedition',button.dataset.expedition);close.focus({preventScroll:true});}
    else if(button.dataset.district){select('district',button.dataset.district);(up||back).focus({preventScroll:true});}
    else if(button.dataset.theme){select('theme',button.dataset.theme);back.focus({preventScroll:true});}
    else if(button.dataset.work){select('work',button.dataset.work);if(inPanel||inList||inIndex)close.focus({preventScroll:true});}
    else if(button.dataset.tool){select('tool',button.dataset.tool);if(inPanel||inList||inIndex)close.focus({preventScroll:true});}
    else if(button.dataset.view){state.view=button.dataset.view;renderSelection();live.textContent=(state.island?byId(themes,state.island).title:works.length+' works')+'. '+state.view+' view.';}
    else if(button===close||button.dataset.action==='parent')returnParent();
    else if(button.dataset.action==='island')returnIsland();
    else if(button.dataset.action==='index'){
      const destination=state.view==='map'?index:list;
      const first=destination.querySelector('[data-work],[data-tool]');
      if(first)first.focus({preventScroll:true});
      destination.scrollIntoView({block:'start',behavior:reduced()?'auto':'smooth'});return;
    }
    else if(button.dataset.action==='overview'||button.dataset.nav==='research')returnOverview();
    else if(button.dataset.nav==='tools')select('tools');
    else if(button.dataset.nav==='about')select('about');
    if(!isMobile()&&inIndex&&!button.dataset.view){
      const detail=button.dataset.work||button.dataset.expedition||button.dataset.tool||button.dataset.nav==='about'||button.dataset.nav==='tools';
      const destination=root.querySelector(detail?'.ea-inspector':'.ea-explorer');
      destination.scrollIntoView({block:'start',behavior:reduced()?'auto':'smooth'});
    }
  });
  root.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    if(!tooltip.hidden){
      event.preventDefault();const restore=tooltip.contains(document.activeElement);
      if(restore&&tooltipSource?.isConnected)tooltipSource.focus({preventScroll:true});
      dismissTooltip();return;
    }
    if(state.island||state.kind!=='overview'){event.preventDefault();returnParent();}
    if(window.matchMedia('(max-width:740px)').matches)root.querySelector('.ea-explorer').scrollIntoView({block:'start',behavior:reduced()?'auto':'smooth'});
  });
  const previewNode=event=>{
    const button=event.target.closest('.ea-node');
    if(button)preview.textContent=citationText(byId(works,button.dataset.work));
  };
  function resetPreview(){hoveredWork=null;hoveredTheme=null;renderConnections();preview.textContent=isMobile()?(expanded?'Drag to move · Pinch to zoom · Tap for details':state.district?'Tap a building for details. Browse the List for every paper.':state.island?'Tap a research theme to explore. Expand the map to drag and zoom.':'Tap an island to explore.') :state.kind==='work'?citationText(byId(works,state.selected)):state.kind==='tool'?'Software · '+byId(tools,state.selected).title:'Scroll to zoom · Hover to explore · Click for details';}
  const inspectSpatial=event=>{if(isMobile())return;const b=event.target.closest('[data-spatial-type]');if(b){preview.textContent=b.dataset.tooltip;hoveredWork=b.dataset.spatialType==='work'?b.dataset.spatialId:null;hoveredTheme=hoveredWork?b.dataset.homeTheme:null;renderConnections();}};
  spatialLayer.addEventListener('pointerover',inspectSpatial);spatialLayer.addEventListener('focusin',inspectSpatial);spatialLayer.addEventListener('pointerleave',resetPreview);spatialLayer.addEventListener('focusout',resetPreview);
  controls.addEventListener('pointerover',previewNode);controls.addEventListener('focusin',previewNode);
  controls.addEventListener('pointerleave',resetPreview);
  function renderDesign(){root.dataset.paper=String(design.paper);root.dataset.labels=design.labels;root.dataset.background=design.background;geometryKey='';renderPanel();drawMap();}
  const tooltip=root.querySelector('.ea-tooltip');
  let tooltipSource=null,tooltipHideTimer=null;
  function dismissTooltip(){
    window.clearTimeout(tooltipHideTimer);tooltip.hidden=true;
    if(tooltipSource)tooltipSource.removeAttribute('aria-describedby');
    tooltipSource=null;
  }
  tooltip.tabIndex=0;preview.tabIndex=0;
  const showTooltip=event=>{
    if(isMobile())return;
    const b=event.target.closest('[data-tooltip]');
    if(!b){if(tooltip.contains(event.target))window.clearTimeout(tooltipHideTimer);return;}
    window.clearTimeout(tooltipHideTimer);
    if(tooltipSource&&tooltipSource!==b)tooltipSource.removeAttribute('aria-describedby');
    tooltipSource=b;b.setAttribute('aria-describedby','ea-hover-description');tooltip.textContent=b.dataset.tooltip;
    if(b.classList.contains('ea-island-label')||b.dataset.expedition)preview.textContent=b.dataset.tooltip;
    tooltip.hidden=false;tooltip.scrollTop=0;
    const r=b.getBoundingClientRect(),box=tooltip.getBoundingClientRect(),height=globalThis.innerHeight||window.innerHeight||800;
    const left=r.right+12+box.width<=innerWidth-12?r.right+12:r.left-box.width-12;
    tooltip.style.left=Math.max(12,Math.min(innerWidth-box.width-12,left))+'px';
    tooltip.style.top=Math.max(12,Math.min(height-box.height-12,r.top))+'px';
  };
  root.addEventListener('pointerover',showTooltip);root.addEventListener('focusin',showTooltip);
  const hideTooltip=event=>{
    const from=event.target.closest('[data-tooltip],.ea-tooltip');if(!from)return;
    if(event.relatedTarget&&(tooltip.contains(event.relatedTarget)||tooltipSource?.contains(event.relatedTarget)))return;
    window.clearTimeout(tooltipHideTimer);
    tooltipHideTimer=window.setTimeout(dismissTooltip,150);
  };
  root.addEventListener('pointerout',hideTooltip);root.addEventListener('focusout',hideTooltip);
  map.addEventListener('wheel',dismissTooltip);
  configureMobile();renderDesign();
  const initial=new URLSearchParams(location.search);if(initial.has('theme')&&byId(themes,initial.get('theme')))select('theme',initial.get('theme'));if(initial.has('work')&&byId(works,initial.get('work')))select('work',initial.get('work'));
  if(globalThis.ResizeObserver){new ResizeObserver(()=>drawMap()).observe(map);}
})();

