const hero=document.querySelector('.hero');
if(hero){
 const svg=hero.querySelector('.hero-scene'),color=hero.querySelector('.scene-color'),blooms=hero.querySelector('#paint-blooms');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),touch=matchMedia('(hover: none)'),mobile=matchMedia('(max-width: 760px)');
 const params=new URLSearchParams(location.search);let raf=0,start=0,active=true,finished=false,motionRaf=0,current=[0,0],target=[0,0];
 const store={get(){try{return sessionStorage.getItem('petr-scene-v1')}catch{return null}},set(){try{sessionStorage.setItem('petr-scene-v1','seen')}catch{}}};
 const patterns=[[720,420,0,1.15],[580,405,.18,1.07],[860,455,.24,1.2],[365,450,.4,1],[1100,420,.44,1.1],[210,270,.51,.95],[1260,430,.54,1],[750,130,.36,1.5],[200,540,.56,1.3],[1350,170,.6,1.35]];
 const NS='http://www.w3.org/2000/svg';
 function blob(i){let d='';for(let n=0;n<80;n++){let a=n/80*Math.PI*2;let r=1+.16*Math.sin(a*3+i)+.09*Math.cos(a*7-i*.8)+.04*Math.sin(a*13);d+=`${n?'L':'M'}${Math.cos(a)*r} ${Math.sin(a)*r*.76} `}return d+'Z'}
 patterns.forEach((p,i)=>{let g=document.createElementNS(NS,'path');g.setAttribute('d',blob(i));g.setAttribute('fill','url(#wet-pigment)');g.setAttribute('opacity',i%3===0?'.92':'1');blooms.append(g)});
 function layout(){let narrow=mobile.matches;hero.toggleAttribute('data-mobile',narrow);svg.setAttribute('viewBox',narrow?'0 0 390 460':'0 0 1440 650');let geometry=narrow?[[0,0,390,430],[27,88,338,176],[0,105,172,258],[192,166,198,198]]:[[-20,0,1480,600],[355,235,740,386],[4,-5,438,657],[955,172,480,480]];svg.querySelectorAll('.scene-layer image').forEach((im,i)=>{['x','y','width','height'].forEach((attr,k)=>im.setAttribute(attr,geometry[i][k]))});blooms.setAttribute('transform',narrow?'translate(-12 -46) scale(.29 .73)':'');}
 function paint(p){hero.dataset.progress=p.toFixed(3);[...blooms.children].forEach((el,i)=>{let [x,y,delay,scale]=patterns[i],q=Math.max(0,(p-delay)/(1-delay));let radius=(Math.pow(q,1.45)*820+.001)*scale;el.setAttribute('transform',`translate(${x} ${y}) scale(${radius})`)});if(p>=1){color.classList.add('is-complete');hero.dataset.state='complete';finished=true;store.set()}else{color.classList.remove('is-complete');hero.dataset.state=p===0?'ink':'wash';finished=false}}
 function animate(now){if(!active){start=0;return}if(!start)start=now;let p=Math.min(1,(now-start)/1800);paint(p);if(p<1)raf=requestAnimationFrame(animate)}
 layout();mobile.addEventListener('change',layout);
 if(reduced.matches||store.get()&&!params.has('scene'))paint(1);else if(params.get('scene')==='ink')paint(0);else if(params.get('scene')==='wash')paint(.51);else if(params.get('scene')==='color')paint(1);else{
   paint(0);Promise.all([...svg.querySelectorAll('image')].map(el=>new Promise(resolve=>{let im=new Image();im.onload=resolve;im.onerror=resolve;im.src=el.getAttribute('href')}))).then(()=>{if(reduced.matches)paint(1);else raf=requestAnimationFrame(animate)});
 }
 const layers=svg.querySelectorAll('.scene-layer');
 function settle(){current=current.map((n,i)=>n+(target[i]-n)*.065);layers.forEach(l=>{let d=+l.dataset.depth;l.style.transform=`translate(${(current[0]*d).toFixed(3)}px,${(current[1]*d*.55).toFixed(3)}px)`});if(active&&Math.abs(current[0]-target[0])+Math.abs(current[1]-target[1])>.002)motionRaf=requestAnimationFrame(settle);else motionRaf=0;}
 hero.addEventListener('pointermove',e=>{if(reduced.matches||touch.matches||mobile.matches||!active)return;let b=hero.getBoundingClientRect();target=[((e.clientX-b.left)/b.width-.5)*2,((e.clientY-b.top)/b.height-.5)*2];if(!motionRaf)motionRaf=requestAnimationFrame(settle)});
 hero.addEventListener('pointerleave',()=>{target=[0,0];if(!motionRaf)motionRaf=requestAnimationFrame(settle)});
 new IntersectionObserver(([entry])=>{active=entry.isIntersecting;if(!active){cancelAnimationFrame(raf);cancelAnimationFrame(motionRaf);motionRaf=0;if(!params.has('scene'))paint(1)}},{threshold:0}).observe(hero);
 reduced.addEventListener('change',()=>{if(reduced.matches){cancelAnimationFrame(raf);cancelAnimationFrame(motionRaf);paint(1);layers.forEach(l=>l.style.transform='none')}});
}
