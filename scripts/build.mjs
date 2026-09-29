import {rateCard} from '../src/rates.mjs';
import {writeFile,copyFile,mkdir,readFile,cp} from 'node:fs/promises';
import {basePath,rebaseHtml,rebaseCss,rebaseData} from './paths.mjs';
import {shell} from '../src/components.mjs';
import {homePage,galleryPage} from '../src/home.mjs';
import {catalogPage,roomPage} from '../src/rooms.mjs';
import {specimen} from '../src/pages.mjs';
import {amenitySpecimen} from '../src/amenities.mjs';
import {englishRooms,allPhotos,locale} from '../src/locales.mjs';
const ru=JSON.parse(await readFile('src/data/rooms.json','utf8'));
await mkdir('dist/assets',{recursive:true});await cp('public','dist',{recursive:true});
for(const f of ['main.js','hero.js','booking.js','calendar.js','stay-dates.js','popups.js','requests.js'])await copyFile(`src/${f}`,`dist/assets/${f}`);
await writeFile('dist/assets/styles.css',rebaseCss((await Promise.all(['styles.css','layout.css','redesign.css','refinements.css','rooms.css','revision.css'].map(f=>readFile('src/'+f,'utf8')))).join('\n')));
await writeFile('dist/assets/favicon.svg','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#722f3a"/><path d="M11 31V9h18v22M16 31V13h8v18" fill="none" stroke="#f6f2e9" stroke-width="2"/></svg>');
for(const lang of ['ru','en']){
 const rooms=lang==='ru'?ru:englishRooms(ru),t=locale(lang),prefix=lang==='en'?'en/':'';
 async function page(route,title,body,options={}){let dir=`dist/${prefix}${route}`;await mkdir(dir,{recursive:true});await writeFile(dir+'index.html',rebaseHtml(shell(title,body,{...options,lang,route:'/'+route})));}
 await writeFile(`dist/assets/rooms${lang==='en'?'.en':''}.json`,rebaseData(rooms.map(r=>({...r,rate:rateCard(r.id,lang)}))));
 await writeFile(`dist/assets/gallery.${lang}.json`,rebaseData(allPhotos(rooms,lang)));
 await page('',t('Петръ Отель — ваш Петербург начинается здесь','Petr Hotel — your St Petersburg begins here'),homePage(rooms,lang),{home:true});
 await page('gallery/',t('Фотогалерея — Петръ Отель','Photo gallery — Petr Hotel'),galleryPage(rooms,lang));
 await page('rooms/',t('Номера и люксы — Петръ Отель','Rooms and suites — Petr Hotel'),catalogPage(rooms,lang));
 for(const r of rooms)await page(`rooms/${r.slug}/`,`${r.name} — ${t('Петръ Отель','Petr Hotel')}`,roomPage(r,rooms,lang));
 await page('design/',t('Компоненты — Петръ Отель','Components — Petr Hotel'),lang==='ru'?specimen():`<section class="section wrap specimen"><h1>Petr Hotel — components</h1><h2>St Petersburg, in every detail</h2><p>Cormorant Garamond / Manrope. Local fonts, shared tokens, visible keyboard focus.</p><a class="button" href="/en/rooms/">Explore rooms</a><a class="button button-outline" href="/en/gallery/">Photo gallery</a>${amenitySpecimen('en')}</section>`);
}
await writeFile('dist/404.html',rebaseHtml(shell('Страница не найдена · Page not found','<section class="wrap section"><h1>Страница не найдена / Page not found</h1><a class="button" href="/">Главная / Home</a></section>',{route:'/'})));
console.log('Built RU + EN: 2 home pages, 2 galleries, 2 catalogues, 30 room pages, specimens and 404.');

await writeFile('dist/assets/fonts.css',rebaseCss(await readFile('public/assets/fonts.css','utf8')));
await writeFile('dist/.nojekyll','');
await writeFile('dist/robots.txt','User-agent: *\nDisallow: /\n');
console.log('Base path:',basePath||'/');
