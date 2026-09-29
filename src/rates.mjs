import {readFileSync} from 'node:fs';
import {locale,root} from './locales.mjs';
export const rates=JSON.parse(readFileSync(new URL('./data/rates.json',import.meta.url),'utf8'));
export function rateLabel(id,l='ru'){
 const t=locale(l),rate=rates.rooms[id];
 return rate?.amount?t(`от ${new Intl.NumberFormat('ru-RU').format(rate.amount)} ₽`,`from RUB ${new Intl.NumberFormat('en-GB').format(rate.amount)}`):t('Выберите другие даты','Explore other dates');
}
export function rateContext(l='ru'){return locale(l)('6–8 октября 2026 · 2 ночи · 1 взрослый','6–8 October 2026 · 2 nights · 1 adult');}
export function rateCard(id,l='ru'){
 const t=locale(l),r=rates.rooms[id];
 const note=r?.amount?t('Минимальная сумма за весь период','Minimum total for the stay'):r?.status==='sold_out'?t('На эти даты номеров не было в наличии','Sold out when checked for these dates'):t('Тариф на эти даты не был представлен','No rate was listed for these dates');
 return `<div class="room-rate" data-rate-id="${id}"><strong>${rateLabel(id,l)}</strong><span>${rateContext(l)}</span><small>${note} · ${t('проверено 29.09.2026','checked 29 Sep 2026')}</small></div>`;
}
export function rateNotice(l='ru'){
 const t=locale(l);return `<div class="rate-notice"><span>${t('Планируем осенний Петербург','An autumn stay in St Petersburg')}</span><p>${rateContext(l)}. ${t('На карточках — реальные минимальные тарифы TravelLine, проверенные 29 сентября. Это пример поездки; при выборе других дат цена и наличие могут измениться.','Cards show actual minimum TravelLine rates checked on 29 September. This is a sample stay; prices and availability may change for other dates.')}</p><a href="${root(l)}rooms/?date=2026-10-06&amp;nights=2&amp;adults=1&amp;children=0#booking">${t('Посмотреть эти даты','Explore these dates')} →</a></div>`;
}
