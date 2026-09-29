import {closePopup} from './popups.js';
import {setupCalendar} from './calendar.js';
import {parseDate, addDays, nights, validRange} from './stay-dates.js';

const english=document.documentElement.lang==='en', t=(ru,en)=>english?en:ru;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const key='petr-stay-v1';
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
let stay={in:addDays(today(),7),out:addDays(today(),9),adults:2,ages:[],promo:''};
try {
  const saved=JSON.parse(sessionStorage.getItem(key));
  if(saved){
    if(validRange(saved.in,saved.out,today())){stay.in=saved.in;stay.out=saved.out;}
    if(Number.isInteger(saved.adults)&&saved.adults>=1&&saved.adults<=4)stay.adults=saved.adults;
    if(Array.isArray(saved.ages)&&saved.ages.length<=2&&saved.ages.every(n=>Number.isInteger(n)&&n>=0&&n<7))stay.ages=saved.ages;
    if(typeof saved.promo==='string')stay.promo=saved.promo.slice(0,64);
  }
}catch{}
const query=new URLSearchParams(location.search);
if(query.has('date')){const arrival=query.get('date'),count=Number(query.get('nights'));if(Number.isInteger(count)&&count>=1&&count<=90&&validRange(arrival,addDays(arrival,count),today())){stay.in=arrival;stay.out=addDays(arrival,count);const adults=Number(query.get('adults'));if(adults>=1&&adults<=4)stay.adults=adults;stay.ages=[];stay.promo='';}}
function save(){try{sessionStorage.setItem(key,JSON.stringify(stay));}catch{}}
const adultLabel=n=>t(n===1?'1 взрослый':`${n} взрослых`,`${n} ${n===1?'adult':'adults'}`);
function agesUI(f){$('[data-child-ages]',f).innerHTML=stay.ages.map((age,i)=>`<label>${t('Возраст ребёнка','Child’s age')} ${i+1}<select data-age="${i}" aria-label="${t('Возраст ребёнка','Child’s age')} ${i+1}">${Array.from({length:7},(_,n)=>`<option value="${n}" ${n===age?'selected':''}>${n} ${t(n===1?'год':n<5&&n>0?'года':'лет',n===1?'year':'years')}</option>`).join('')}</select></label>`).join('');}
function sync(origin){
  $$('[data-booking]').forEach(f=>{
    for(const part of ['in','out']){
      $(`[data-date="${part}"]`,f).value=stay[part];
      $(`[data-date-label="${part}"]`,f).textContent=new Intl.DateTimeFormat(english?'en-GB':'ru-RU',{day:'numeric',month:'short',timeZone:'UTC'}).format(parseDate(stay[part]));
    }
    if(f!==origin){$('[data-adults]',f).value=stay.adults;$('[data-children]',f).value=stay.ages.length;agesUI(f);$('[data-promo]',f).value=stay.promo;}
    $('[data-guest-label]',f).textContent=adultLabel(stay.adults)+(stay.ages.length?`, ${stay.ages.length} ${t(stay.ages.length===1?'ребёнок':'ребёнка',stay.ages.length===1?'child':'children')}`:'');
    $('[name="children"]',f).value=stay.ages.length;
    const ages=$('[name="children-age"]',f);ages.disabled=!stay.ages.length;ages.value=stay.ages.join(',');
    $('[name="nights"]',f).value=nights(stay.in,stay.out);
    const promo=$('[name="promo-code-plain"]',f);promo.disabled=!stay.promo.trim();promo.value=stay.promo.trim();
    $('[data-promo-label]',f.parentElement).textContent=stay.promo.trim()?t(`Промокод: ${stay.promo.trim()}`,`Promo code: ${stay.promo.trim()}`):t('Есть промокод?','Have a promo code?');
  });
  $$('[data-account-link]').forEach(a=>{const url=new URL(a.href);url.searchParams.set('date',stay.in);url.searchParams.set('nights',nights(stay.in,stay.out));url.searchParams.set('adults',stay.adults);url.searchParams.set('children',stay.ages.length);if(stay.ages.length)url.searchParams.set('children-age',stay.ages.join(','));else url.searchParams.delete('children-age');if(stay.promo.trim())url.searchParams.set('promo-code-plain',stay.promo.trim());else url.searchParams.delete('promo-code-plain');a.href=url.href;});
}
$$('[data-booking]').forEach(f=>{
  f.addEventListener('change',e=>{
    const input=e.target;
    if(input.hasAttribute('data-adults'))stay.adults=+input.value;
    if(input.hasAttribute('data-children')){stay.ages=Array.from({length:+input.value},(_,i)=>stay.ages[i]??0);agesUI(f);}
    if(input.hasAttribute('data-age'))stay.ages[+input.dataset.age]=+input.value;
    save();sync(f);
  });
  $('[data-promo]',f).addEventListener('input',e=>{stay.promo=e.target.value;save();sync(f);});
  $('[data-promo]',f).addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();closePopup($('.promo-popover',f));$('[data-promo-label]',f.parentElement).parentElement.focus();}});
  f.addEventListener('submit',e=>{
    const error=$('.form-error',f);
    if(!validRange(stay.in,stay.out,today())){
      e.preventDefault();error.hidden=false;error.textContent=t('Проверьте даты: заезд — не раньше сегодня, выезд — позже заезда.','Check your dates: arrive today or later and depart after check-in.');
      $('[data-calendar-open="in"]',f).setAttribute('aria-invalid','true');$('[data-calendar-open="in"]',f).focus();return;
    }
    error.hidden=true;sync();save();
  });
});
sync();
setupCalendar({lang:english?'en':'ru',today,getStay:()=>stay,commit:range=>{
  stay={...stay,...range};save();sync();
  $$('.form-error').forEach(e=>e.hidden=true);$$('[data-calendar-open]').forEach(e=>e.removeAttribute('aria-invalid'));
}});
