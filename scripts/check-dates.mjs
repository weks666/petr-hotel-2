import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
import {parseDate,addDays,addMonths,nights,validRange,chooseDate} from '../src/stay-dates.js';
const results=[];
function check(name,fn){fn();results.push(name);}
check('Reject impossible and malformed dates',()=>{for(const date of ['2026-02-29','2026-04-31','2026-2-01','bad','',null])assert.equal(parseDate(date),null);});
check('Leap day and month boundaries',()=>{assert.ok(parseDate('2028-02-29'));assert.equal(addDays('2028-02-28',1),'2028-02-29');assert.equal(addDays('2028-02-29',1),'2028-03-01');});
check('Year boundary in both directions',()=>{assert.equal(addDays('2026-12-31',1),'2027-01-01');assert.equal(addDays('2027-01-01',-1),'2026-12-31');});
check('Month navigation clamps the day',()=>{assert.equal(addMonths('2026-01-31',1),'2026-02-28');assert.equal(addMonths('2028-01-31',1),'2028-02-29');assert.equal(addMonths('2028-02-29',12),'2029-02-28');});
check('Nights across daylight-saving weekends',()=>{assert.equal(nights('2026-03-28','2026-03-30'),2);assert.equal(nights('2026-10-24','2026-10-26'),2);});
check('Range must be real, future and at least one night',()=>{assert.ok(validRange('2026-09-29','2026-09-30','2026-09-29'));for(const [a,b] of [['2026-09-28','2026-10-01'],['2026-09-29','2026-09-29'],['2026-10-02','2026-10-01'],['2026-09-31','2026-10-01']])assert.equal(validRange(a,b,'2026-09-29'),false);});
check('Arrival selection resets departure',()=>assert.deepEqual(chooseDate({in:'2026-10-06',out:'2026-10-08'},'2026-10-31','in'),{in:'2026-10-31',out:'',part:'out'}));
check('Earlier second click becomes new arrival',()=>assert.deepEqual(chooseDate({in:'2026-10-31',out:''},'2026-10-29','out'),{in:'2026-10-29',out:'',part:'out'}));
check('Same-day second click cannot create zero-night stay',()=>assert.deepEqual(chooseDate({in:'2026-10-31',out:''},'2026-10-31','out'),{in:'2026-10-31',out:'',part:'out'}));
check('Range can cross month and year',()=>assert.deepEqual(chooseDate({in:'2026-12-31',out:''},'2027-01-02','out'),{in:'2026-12-31',out:'2027-01-02',part:'done'}));
const report={date:new Date().toISOString(),passed:results.length,checks:results};
await mkdir('evidence/v3',{recursive:true});
await writeFile('evidence/v3/date-checks.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
