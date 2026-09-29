import {esc} from './components.mjs';

// One pictogram and one group per source amenity, shared by both languages.
const drawings={
 wifi:'<path d="M3 9a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0m-9 3a5 5 0 0 1 6 0"/><circle cx="12" cy="19" r=".8"/>',
 climate:'<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 3 3-3M9 20l3-3 3 3M4 10l4-1-1-4m10 14-1-4 4-1M4 14l4 1-1 4m10-14-1 4 4 1"/>',
 safe:'<rect x="3" y="4" width="18" height="16" rx="2"/><rect x="6" y="7" width="12" height="10" rx="1"/><circle cx="12" cy="12" r="2"/><path d="M12 10V9m0 6v-1m-2-2H9m6 0h-1M7 20v2m10-2v2"/>',
 tv:'<rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 22h8m-4-4v4"/>',
 robe:'<path d="m8 3-5 3-2 7 4 1 1-4v11h12V10l1 4 4-1-2-7-5-3-4 6-4-6Zm0 0 4 12 4-12M6 15h12m-6 0 3 4"/>',
 shower:'<path d="M5 21V6a3 3 0 0 1 6 0v1m-4 4a4 4 0 0 1 8 0H7Zm2 4v1m4-1v1m-5 3v1m4-1v1m4-1v1"/>',
 tea:'<path d="M4 9h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Zm12 1h2a3 3 0 0 1 0 6h-2M2 23h18M8 6c-2-2 2-3 0-5m5 5c-2-2 2-3 0-5"/>',
 hairdryer:'<path d="M4 5h10a5 5 0 0 1 0 10H9l1 6H6l-1-6H4V5Zm10 0v10M4 7H1v6h3m14-7 4-1m-3 5h3m-4 4 4 1"/>',
 fridge:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M5 9h14M8 5v1m0 6v4"/>',
 desk:'<path d="M2 12h20M4 12v9m16-9v9M13 12v5h7M7 12V5h8v7M5 5h12m-1 9h1"/>',
 water:'<path d="M9 3h6M10 3v4c0 2-3 3-3 5v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-8c0-2-3-3-3-5V3M7 12h10m-10 5h10"/>',
 toiletries:'<rect x="4" y="9" width="8" height="12" rx="2"/><path d="M8 9V5m-3 0h8V3M16 13h5v8h-5V13Zm0 0 1-6h3l1 6"/>',
 pillow:'<path d="M3 6c6 2 12 2 18 0-1 4-1 8 0 12-6-2-12-2-18 0 1-4 1-8 0-12ZM7 10v4m10-4v4"/>',
 smoking:'<path d="M3 15h13v4H3m10-4v4m6-4v4m3-4v4M17 3c-3 3 4 3 1 6m3-5c-2 2 3 4 1 6M2 2l20 20"/>',
 coffee:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M5 7h14m-8 0v3m-3 3h7v2a3 3 0 0 1-3 3h-1a3 3 0 0 1-3-3v-2Zm7 0h2v3h-2M8 20h8"/><circle cx="16" cy="4.5" r=".5"/>',
 bath:'<path d="M2 12h20l-1 5a3 3 0 0 1-3 2H6a3 3 0 0 1-3-2l-1-5Zm3 0V5a3 3 0 0 1 6 0M8 6h5M6 19v3m12-3v3"/>',
 kitchen:'<path d="M2 10h20v11H2V10Zm10 0v11M5 14h3m8 0h3M4 10V4h5v3M16 8h5V4h-5v4Z"/>',
 hob:'<rect x="2" y="5" width="20" height="15" rx="2"/><path d="M2 10h20m14 0v10m3-7v1m0 3v1M5 3h5m4 0h5"/><rect x="5" y="13" width="8" height="4" rx="1"/>',
 rooms:'<path d="M3 3h18v18H3V3Zm9 0v8m0 5v5M3 13h4m5 3a5 5 0 0 0 5-5h-5"/>',
 cot:'<path d="M3 8h18v9H3V8Zm0-2v15m18-15v15M7 8v9m5-9v9m5-9v9M5 3h14m-2 0v5"/>',
 dining:'<path d="M4 3v6a2 2 0 0 0 4 0V3M6 3v18m12 0V3c-4 3-4 10 0 10"/>',
 dishwasher:'<rect x="3" y="2" width="18" height="20" rx="2"/><path d="M3 7h18m-3-3h1M6 18h12M7 11v6m4-6v6m4-6v6m-8-7h10"/>',
 bathrooms:'<path d="M3 3h18v18H3V3Zm9 0v18M5 12h5m-4 0V8h2m6 7h5m-4 0v-5h2"/>',
 balcony:'<path d="M6 12V3h12v9M12 3v9M2 12h20M3 12v9m18-9v9M3 20h18M7 12v8m5-8v8m5-8v8"/>',
 wardrobe:'<path d="M4 2h16v19H4V2Zm8 0v19M8 10v3m8-3v3M6 21v1m12-1v1"/>',
 bell:'<path d="M3 17a9 9 0 0 1 18 0H3Zm-1 4h20M12 8V5m-2 0h4"/>',
 car:'<path d="m3 10 3-6h12l3 6M3 10h18v9H3v-9Zm3 9v3m12-3v3M2 10h1m18 0h1M6 14h2m8 0h2"/>',
 passport:'<rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="10" r="4"/><path d="M8 10h8m-4-4c-2 3-2 5 0 8 2-3 2-5 0-8M9 18h6"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>'
};
export function amenityIcon(key){if(!drawings[key])throw new Error('Missing pictogram: '+key);return `<svg class="icon amenity-icon" data-amenity-icon="${key}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${drawings[key]}</svg>`}
export const amenityDefinitions=[
 ['Wi-Fi','Wi-Fi','wifi','work'],['Кондиционер','Air conditioning','climate','rest'],['Сейф','Safe','safe','work'],['Телевизор','TV','tv','rest'],
 ['Халаты и тапочки','Bathrobes and slippers','robe','bath'],['Душ','Shower','shower','bath'],['Чайная станция','Tea station','tea','food'],
 ['Фен','Hairdryer','hairdryer','bath'],['Мини-холодильник','Mini fridge','fridge','food'],['Письменный стол','Desk','desk','work'],['Питьевая вода','Drinking water','water','food'],
 ['Косметические средства','Toiletries','toiletries','bath'],['Меню подушек','Pillow menu','pillow','rest'],['Номер для некурящих','Non-smoking room','smoking','rest'],
 ['Кофемашина','Coffee machine','coffee','food'],['Ванна','Bathtub','bath','bath'],['Мини-кухня','Kitchenette','kitchen','food'],['Плита и микроволновая печь','Hob and microwave','hob','food'],
 ['Душ или ванна','Shower or bathtub','bath','bath'],['Две комнаты','Two rooms','rooms','rest'],['Детская кроватка по запросу','Cot on request','cot','rest'],
 ['Кухня и обеденная зона','Kitchen and dining area','dining','food'],['Ванна у окна','Bathtub by the window','bath','bath'],['Кухня','Kitchen','kitchen','food'],
 ['Посудомоечная машина','Dishwasher','dishwasher','food'],['Две ванные комнаты','Two bathrooms','bathrooms','bath'],['Ванна и душ','Bathtub and shower','bath','bath'],
 ['Балкон','Balcony','balcony','rest'],['Гардеробная','Dressing room','wardrobe','rest']
];
export function amenityDefinition(label){const entry=amenityDefinitions.find(a=>a[0]===label||a[1]===label);if(!entry)throw new Error('Unmapped amenity: '+label);return {label,icon:entry[2],group:entry[3]}}
export function amenityGroups(amenities,lang='ru'){
 const items=amenities.map(amenityDefinition),en=lang==='en',hasKitchen=items.some(a=>['kitchen','hob','dining','dishwasher'].includes(a.icon));
 return [['rest','Отдых и пространство','Rest and relaxation'],['bath','Ванная комната','In the bathroom'],['food',hasKitchen?'Кухня и напитки':'Напитки в номере',hasKitchen?'Kitchen and refreshments':'In-room refreshments'],['work','Всё под рукой','Everyday essentials']].map(([key,ru,eng])=>({key,title:en?eng:ru,items:items.filter(a=>a.group===key)})).filter(g=>g.items.length);
}
export function comforts(amenities,lang='ru'){return `<div class="comfort-groups">${amenityGroups(amenities,lang).map(group=>`<section class="comfort-group" aria-label="${group.title}"><h3>${group.title}</h3><ul>${group.items.map(a=>`<li>${amenityIcon(a.icon)}<span>${esc(a.label)}</span></li>`).join('')}</ul></section>`).join('')}</div>`}
export function amenitySpecimen(lang='ru'){return `<section class="amenity-specimen"><h2>${lang==='en'?'Room pictograms':'Пиктограммы удобств'}</h2>${comforts(amenityDefinitions.map(a=>a[lang==='en'?1:0]),lang)}</section>`}
