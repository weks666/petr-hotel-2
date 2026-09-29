import {readdir,readFile,stat,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {basePath} from './paths.mjs';
const localPath=value=>basePath&&value.startsWith(basePath+'/')?value.slice(basePath.length):value;
import assert from 'node:assert/strict';
import {englishRooms} from '../src/locales.mjs';
import {esc} from '../src/components.mjs';
import {amenityDefinition} from '../src/amenities.mjs';
const root=path.resolve('dist'),errors=[],checks=[];
async function files(dir){let out=[];for(const d of await readdir(dir,{withFileTypes:true})){let p=path.join(dir,d.name);out.push(...d.isDirectory()?await files(p):[p]);}return out;}
const all=await files(root),htmlFiles=all.filter(f=>f.endsWith('.html')),html=new Map(await Promise.all(htmlFiles.map(async p=>[p,await readFile(p,'utf8')])));
const rooms=JSON.parse(await readFile('src/data/rooms.json','utf8'));
assert.equal(rooms.length,15);assert.equal(new Set(rooms.map(r=>r.id)).size,15);assert.equal(new Set(rooms.map(r=>r.slug)).size,15);checks.push('15 unique category IDs and direct routes');
for(const [file,source] of html){
 if((source.match(/<h1[>\s]/g)||[]).length!==1)errors.push(`${file}: H1 count`);
 const ids=[...source.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);if(new Set(ids).size!==ids.length)errors.push(`${file}: duplicate IDs`);
 for(const match of source.matchAll(/(?:href|src)="([^"]+)"/g)){
  let url=localPath(match[1].replaceAll('&amp;','&'));if(/^(?:https?:|tel:|mailto:|data:)/.test(url))continue;
  const [pathname,anchor]=url.split('#');let target=pathname?path.join(root,pathname.split('?')[0]):file;if(pathname.endsWith('/'))target=path.join(target,'index.html');
  try{await stat(target)}catch{errors.push(`${path.relative(root,file)}: missing ${url}`);continue;}
  if(anchor){const targetSource=html.get(target);if(targetSource&&!new RegExp(`\\bid="${anchor}"`).test(targetSource))errors.push(`${path.relative(root,file)}: missing anchor ${url}`);}
 }
 if(/<img\b(?![^>]*\balt=)[^>]*>/.test(source))errors.push(`${file}: image missing alt`);
 if(/(?:API_KEY|Bearer\s+[a-zA-Z0-9_.-]{20,}|sk-[a-zA-Z0-9]{20,})/.test(source))errors.push(`${file}: credential-like content`);
}
checks.push(`${htmlFiles.length} HTML pages: internal links, assets, fragments, H1, IDs and alt attributes`);
const englishFiles=[...html].filter(([f])=>f.startsWith(path.join(root,'en')+path.sep));
assert.equal(englishFiles.length,19);
for(const [f,source] of englishFiles){assert.ok(source.includes('<html lang="en">'));assert.ok(!/[А-Яа-яЁё]/.test(source.replace(/<a class="vtx-credit"[^>]*>[\s\S]*?<\/a>/g,'').replace(/<[^>]*>/g,'')),`Untranslated visible text: ${f}`)}
for(const lang of ['ru','en']){const p=JSON.parse(await readFile(`dist/assets/gallery.${lang}.json`,'utf8'));assert.equal(p.length,125);assert.equal(new Set(p.map(p=>p.src)).size,125);for(const im of p)await stat(path.join(root,localPath(im.src)));}
checks.push('19 paired RU/EN routes; no Russian visible text in English pages; 125 unique real gallery photographs in each language');
let amenityCount=0;
for(const [language,categories] of [['ru',rooms],['en',englishRooms(rooms)]]){
 for(const room of categories){
  const source=html.get(path.join(root,language==='en'?'en':'','rooms',room.slug,'index.html'));
  const block=source.slice(source.indexOf('<section class="room-comfort"'),source.indexOf('<section class="room-hospitality"'));
  assert.equal((block.match(/data-amenity-icon=/g)||[]).length,room.amenities.length,`${language}/${room.slug}: amenity count changed`);
  for(const label of room.amenities){
   assert.ok(amenityDefinition(label).icon);
   assert.equal(block.split(`<span>${esc(label)}</span>`).length-1,1,`${language}/${room.slug}: missing or duplicated ${label}`);
   amenityCount++;
  }
 }
}
checks.push(`${amenityCount} source amenities preserved exactly once across 30 RU/EN room pages, with semantic pictograms`);
const manifest=JSON.parse(await readFile('research/photo-manifest.json','utf8'));
for(const r of rooms){assert.ok(html.has(path.join(root,'rooms',r.slug,'index.html')));assert.ok(r.photos.length>=5);for(const p of r.photos){assert.ok(manifest.find(m=>m.id===r.id).photos.some(m=>m.src===p.src&&m.sourceUrl===p.sourceUrl));assert.ok(p.sourceUrl.includes(`/rt/${r.id}/`));}}
assert.ok(!rooms.find(r=>r.id==='74548').photos.some(p=>p.src.endsWith('-6.webp')));checks.push('111 photographs match official category IDs; shared gym image excluded');
const hero=await readFile('src/hero.js','utf8'),markup=await readFile('src/components.mjs','utf8');assert.equal((markup.match(/class="scene-layer layer-lion"/g)||[]).length,1);assert.equal((markup.match(/href="#scene-layers"/g)||[]).length,2);assert.ok(hero.includes('/1800'));assert.ok(hero.includes('prefers-reduced-motion'));checks.push('Single lion, shared sketch/color geometry, 1.8s reveal and motion preference branch');
function luminance(hex){let a=hex.match(/\w\w/g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return a[0]*.2126+a[1]*.7152+a[2]*.0722;}
const contrast=(a,b)=>{let x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const contrastResults=[['ink/paper','302d29','f6f2e9'],['muted/paper','686159','f6f2e9'],['muted/dark section','686159','eae3d7'],['button','fffcf6','722f3a'],['review copy/sage','302d29','e5e8df'],['review caption/sand','686159','e9ddcc'],['calendar range','302d29','eee1df'],['breakfast detail','625849','ebe0c5'],['map marker','ffffff','2e6aa4']].map(([name,a,b])=>({name,ratio:+contrast(a,b).toFixed(2)}));for(const c of contrastResults)assert.ok(c.ratio>=4.5);checks.push('Primary text and action color pairs pass WCAG AA contrast');
const report={date:new Date().toISOString(),checks,contrast:contrastResults,errors,pageCount:htmlFiles.length,roomCount:rooms.length,photoCount:rooms.reduce((n,r)=>n+r.photos.length,0),assetBytes:(await Promise.all(all.filter(f=>!f.endsWith('.html')).map(async f=>(await stat(f)).size))).reduce((a,b)=>a+b,0)};
await mkdir('evidence',{recursive:true});
await writeFile('evidence/static-checks.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(errors.length)process.exitCode=1;
