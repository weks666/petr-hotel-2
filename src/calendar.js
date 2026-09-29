import {parseDate, addDays, addMonths, monthStart, nights, validRange, chooseDate} from './stay-dates.js';

export function setupCalendar({lang, today, getStay, commit}) {
  const t = (ru, en) => lang === 'en' ? en : ru;
  const format = (date, options) => new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'ru-RU', {...options, timeZone:'UTC'}).format(parseDate(date));
  const short = date => date ? format(date,{day:'numeric',month:'short'}) : t('Выберите дату','Choose a date');
  const dialog = document.querySelector('#stay-calendar');
  if (!dialog) return;
  const $ = s => dialog.querySelector(s), $$ = s => [...dialog.querySelectorAll(s)];
  const compact = matchMedia('(max-width: 640px)');
  let opener, draft, part, month, focusDate;
  const count = () => compact.matches ? 1 : 2;
  function nightLabel(n) {return t(`${n} ${n%10===1 && n%100!==11?'ночь':n%10>=2 && n%10<=4 && !(n%100>=12 && n%100<=14)?'ночи':'ночей'}`,`${n} ${n===1?'night':'nights'}`);}
  function ensureVisible(date) {
    if(date < month) month = monthStart(date);
    else if(date >= addMonths(month,count())) month = addMonths(monthStart(date),1-count());
  }
  function render(focus = false) {
    const weekdays = lang === 'en' ? ['Mo','Tu','We','Th','Fr','Sa','Su'] : ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
    $('[data-calendar-months]').innerHTML = Array.from({length:count()},(_,index)=>{
      const first = addMonths(month,index), d = parseDate(first), offset = (d.getUTCDay()+6)%7;
      const days = nights(first,addMonths(first,1));
      const cells = [...Array.from({length:offset},()=>'<td></td>'),...Array.from({length:days},(_,i)=>{
        const date=addDays(first,i), start=date===draft.in, end=date===draft.out, inside=date>draft.in && date<draft.out;
        return `<td class="${start?'range-start ':''}${end?'range-end ':''}${inside?'in-range':''}"><button type="button" data-day="${date}" ${date<today()?'disabled':''} class="${date===today()?'is-today':''}" tabindex="${date===focusDate?0:-1}" aria-label="${format(date,{weekday:'long',day:'numeric',month:'long',year:'numeric'})}${start?t(', заезд',', check-in'):end?t(', выезд',', check-out'):''}" aria-pressed="${start||end}">${i+1}</button></td>`;
      })];
      while(cells.length%7) cells.push('<td></td>');
      return `<table class="calendar-month"><caption>${format(first,{month:'long',year:'numeric'})}</caption><thead><tr>${weekdays.map(w=>`<th scope="col">${w}</th>`).join('')}</tr></thead><tbody>${Array.from({length:cells.length/7},(_,r)=>`<tr>${cells.slice(r*7,r*7+7).join('')}</tr>`).join('')}</tbody></table>`;
    }).join('');
    $('[data-month-prev]').disabled = month<=monthStart(today());
    $('[data-calendar-in]').textContent = short(draft.in);
    $('[data-calendar-out]').textContent = short(draft.out);
    $$('[data-calendar-part]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.calendarPart===part)));
    const valid = validRange(draft.in,draft.out,today());
    $('[data-calendar-apply]').disabled = !valid;
    $('[data-calendar-status]').textContent = valid ? `${nightLabel(nights(draft.in,draft.out))} · ${format(draft.in,{day:'numeric',month:'long'})} — ${format(draft.out,{day:'numeric',month:'long'})}` : t('Теперь выберите дату выезда','Now choose your check-out date');
    if(focus) $(`[data-day="${focusDate}"]`)?.focus();
  }
  function open(trigger) {
    opener=trigger; draft={in:getStay().in,out:getStay().out}; part=trigger.dataset.calendarOpen;
    focusDate=draft[part] || draft.in; month=monthStart(focusDate);
    render(); dialog.showModal(); $(`[data-day="${focusDate}"]`)?.focus();
  }
  document.querySelectorAll('[data-calendar-open]').forEach(b=>b.addEventListener('click',()=>open(b)));
  $('[data-calendar-close]').addEventListener('click',()=>dialog.close());
  $('[data-calendar-cancel]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>opener?.focus());
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  $('[data-calendar-apply]').addEventListener('click',()=>{
    if(validRange(draft.in,draft.out,today())) {commit(draft);dialog.close();}
  });
  $$('[data-calendar-part]').forEach(b=>b.addEventListener('click',()=>{part=b.dataset.calendarPart;focusDate=draft[part]||draft.in;ensureVisible(focusDate);render(true);}));
  $$('[data-month-prev],[data-month-next]').forEach(b=>b.addEventListener('click',()=>{
    month=addMonths(month,b.hasAttribute('data-month-prev')?-1:1);
    focusDate=month<today()?today():month;render();
  }));
  $('[data-calendar-months]').addEventListener('click',e=>{
    const b=e.target.closest('[data-day]');if(!b||b.disabled)return;
    const next=chooseDate(draft,b.dataset.day,part==='done'?'in':part);
    draft={in:next.in,out:next.out};part=next.part;focusDate=b.dataset.day;render(true);
  });
  $('[data-calendar-months]').addEventListener('keydown',e=>{
    const b=e.target.closest('[data-day]');if(!b)return;
    const current=b.dataset.day, dayOfWeek=(parseDate(current).getUTCDay()+6)%7;
    const move={ArrowRight:1,ArrowLeft:-1,ArrowUp:-7,ArrowDown:7,Home:-dayOfWeek,End:6-dayOfWeek};
    let next;if(e.key in move)next=addDays(current,move[e.key]);
    else if(e.key==='PageUp'||e.key==='PageDown')next=addMonths(current,(e.key==='PageUp'?-1:1)*(e.shiftKey?12:1));
    if(next){e.preventDefault();focusDate=next<today()?today():next;ensureVisible(focusDate);render(true);}
  });
  compact.addEventListener('change',()=>{if(dialog.open){ensureVisible(focusDate);render();}});
}
