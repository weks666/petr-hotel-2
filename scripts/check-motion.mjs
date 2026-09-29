import vm from 'node:vm';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const code=await readFile('src/hero.js','utf8');
function environment({reduced=false,touch=false,mobile=false,query='?scene=ink',seen=false}={}){
 const frames=new Map();let seq=0,observer;
 const node=()=>({children:[],dataset:{},style:{},attrs:{},events:{},classList:{set:new Set(),add(s){this.set.add(s)},remove(s){this.set.delete(s)},contains(s){return this.set.has(s)}},setAttribute(k,v){this.attrs[k]=String(v)},getAttribute(k){return this.attrs[k]},append(c){this.children.push(c)},addEventListener(k,v){this.events[k]=v},toggleAttribute(){}});
 const hero=node(),svg=node(),color=node(),blooms=node(),replay=node(),layers=[1,3,8,10].map(d=>Object.assign(node(),{dataset:{depth:String(d)}})),images=layers.map(node);
 hero.querySelector=s=>({'.hero-scene':svg,'.scene-color':color,'#paint-blooms':blooms,'.replay':replay}[s]);hero.getBoundingClientRect=()=>({left:0,top:0,width:1440,height:760});svg.querySelectorAll=s=>s==='image'||s==='.scene-layer image'?images:layers;
 const context={URLSearchParams,Math,Image:class{},document:{querySelector:()=>hero,createElementNS:node,addEventListener(){},activeElement:{tagName:'BODY'}},matchMedia:s=>({matches:s.includes('reduced')?reduced:s.includes('hover')?touch:mobile,addEventListener(){}}),location:{search:query},sessionStorage:{getItem:()=>seen?'seen':null,setItem(){}},requestAnimationFrame:cb=>{frames.set(++seq,cb);return seq},cancelAnimationFrame:id=>frames.delete(id),IntersectionObserver:class{constructor(cb){observer=cb}observe(){}}};
 vm.runInNewContext(code,context);return {hero,svg,color,blooms,replay,layers,frames,step(time){const jobs=[...frames.values()];frames.clear();jobs.forEach(cb=>cb(time))},visibility(value){observer([{isIntersecting:value}])}};
}
const results=[];
let e=environment({reduced:true});assert.equal(e.hero.dataset.state,'complete');assert.ok(e.color.classList.contains('is-complete'));assert.equal(e.frames.size,0);e.replay.events.click();e.hero.events.pointermove({clientX:1400,clientY:650});assert.equal(e.frames.size,0);results.push('Reduced motion: immediate color; replay and pointer movement schedule no animation');
e=environment({touch:true});e.hero.events.pointermove({clientX:1400,clientY:650});assert.equal(e.frames.size,0);results.push('Touch: pointer parallax disabled');
e=environment({mobile:true});assert.equal(e.svg.attrs.viewBox,'0 0 390 460');e.hero.events.pointermove({clientX:300,clientY:350});assert.equal(e.frames.size,0);results.push('Mobile: separate geometry and no pointer parallax');
e=environment({seen:true,query:''});assert.equal(e.hero.dataset.state,'complete');assert.equal(e.frames.size,0);results.push('Repeat visit in session: immediate finished scene');
e=environment();assert.equal(e.hero.dataset.state,'ink');assert.equal(e.blooms.children.length,10);e.replay.events.click();e.step(10);e.step(910);assert.equal(e.hero.dataset.progress,'0.500');assert.equal(e.hero.dataset.state,'wash');e.step(1810);assert.equal(e.hero.dataset.state,'complete');assert.equal(e.frames.size,0);results.push('Replay: ink → 10 separate pigment blooms → full color at 1800 ms');
e=environment({query:'?scene=color'});e.hero.events.pointermove({clientX:1400,clientY:650});e.step(10);const offsets=e.layers.map(l=>parseFloat(l.style.transform.slice(10)));assert.ok(offsets[0]<offsets[1]&&offsets[1]<offsets[2]&&offsets[2]<offsets[3]);e.hero.events.pointerleave();for(let t=20;t<2200&&e.frames.size;t+=16)e.step(t);assert.ok(Math.abs(parseFloat(e.layers[3].style.transform.slice(10)))<.03);results.push('Four motion depths and smooth return to neutral');
e=environment();e.replay.events.click();e.visibility(false);assert.equal(e.frames.size,0);e.replay.events.click();assert.equal(e.hero.dataset.state,'complete');assert.equal(e.frames.size,0);results.push('Offscreen animation cancelled; replay cannot leave an unfinished scene');
await writeFile('evidence/motion-checks.json',JSON.stringify({type:'deterministic source-logic tests with simulated media queries; not physical device emulation',results},null,2)+'\n');console.log(results.join('\n'));
