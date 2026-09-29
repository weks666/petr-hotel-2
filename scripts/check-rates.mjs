import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const rooms=JSON.parse(await readFile('src/data/rooms.json','utf8'));
const rates=JSON.parse(await readFile('src/data/rates.json','utf8'));
assert.deepEqual(Object.keys(rates.rooms).sort(),rooms.map(r=>r.id).sort());
assert.equal(rates.unit,'minimum_total_for_stay');
assert.equal(rates.arrival,'2026-10-06');assert.equal(rates.departure,'2026-10-08');
assert.equal(rates.nights,2);assert.equal(rates.adults,1);assert.equal(rates.children,0);
assert.equal(rates.currency,'RUB');assert.equal(rates.checkedAt,'2026-09-29');
assert.equal(Object.values(rates.rooms).filter(r=>r.amount!==null).length,7);
for(const rate of Object.values(rates.rooms))assert.equal(rate.status==='available',Number.isInteger(rate.amount)&&rate.amount>0);
for(const lang of ['ru','en']){
 const prefix=lang==='en'?'en/':'';
 const catalog=await readFile(`dist/${prefix}rooms/index.html`,'utf8');
 assert.equal((catalog.match(/data-rate-id=/g)||[]).length,15);
 for(const room of rooms){const page=await readFile(`dist/${prefix}rooms/${room.slug}/index.html`,'utf8');assert.ok(page.includes(`data-rate-id="${room.id}"`));}
 const home=await readFile(`dist/${prefix}index.html`,'utf8');
 assert.match(home,/main\.js\?v=[a-f0-9]{12}/);
 assert.ok(!home.includes('popovertarget'));assert.ok(!home.includes('class="replay"'));
 for(const [tag]of home.matchAll(/<dialog[^>]*data-popup[^>]*>/g))assert.ok(tag.includes(' hidden'), 'A popup must be hidden before JavaScript loads');
}
for(const module of ['main.js','booking.js','calendar.js']){
 const code=await readFile(`dist/assets/${module}`,'utf8');
 assert.ok(!/(?:from|import)\s*['"]\.\/[^'"]+\.js['"]/.test(code),'Every browser module import needs the release version');
}
assert.match(await readFile('dist/assets/main.js','utf8'),/\.json\?v=[a-f0-9]{12}/);
console.log('Dated total prices, all room IDs and explicit popup visibility verified.');
