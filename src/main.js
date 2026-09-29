import './popups.js';
import './booking.js';
const lang=document.documentElement.lang,english=lang==='en',t=(ru,en)=>english?en:ru,base=new URL('../',import.meta.url).pathname+(english?'en/':'');
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const menu=$('#mobile-menu'),toggle=$('.menu-toggle');
if(menu){let opener;toggle.addEventListener('click',()=>{opener=document.activeElement;menu.showModal();toggle.setAttribute('aria-expanded','true')});$('.menu-close').addEventListener('click',()=>menu.close());menu.addEventListener('close',()=>{toggle.setAttribute('aria-expanded','false');opener?.focus()});$$('a',menu).forEach(a=>a.addEventListener('click',()=>menu.close()));menu.addEventListener('click',e=>{if(e.target===menu){let r=menu.getBoundingClientRect();if(e.clientX<r.left)menu.close()}})}
const header=$('.header'),heroLogo=$('.hero-identity h1'),smallBrand=$('.small-brand');
function scrollHeader(){const show=heroLogo?heroLogo.getBoundingClientRect().bottom<=header.offsetHeight:scrollY>4;header.classList.toggle('is-scrolled',show);if(heroLogo){smallBrand.tabIndex=show?0:-1;smallBrand.setAttribute('aria-hidden',String(!show))}}
let headerFrame=0;window.addEventListener('scroll',()=>{if(!headerFrame)headerFrame=requestAnimationFrame(()=>{scrollHeader();headerFrame=0})},{passive:true});window.addEventListener('resize',scrollHeader);scrollHeader();
$$('img[data-photo]').forEach(img=>img.addEventListener('error',()=>{img.hidden=true;const fallback=document.createElement('div');fallback.className='photo-fallback'+(img.closest('.gallery-thumbs')?' thumbnail-fallback':'');fallback.textContent=img.closest('.gallery-thumbs')?t('Нет фото','No photo'):t('Фотография временно недоступна. Посмотрите другие снимки в галерее.','This photo is temporarily unavailable. Please view another photo in the gallery.');img.parentElement.append(fallback)}));

function showPhoto(image,photo){image.hidden=false;image.parentElement.querySelectorAll('.photo-fallback').forEach(el=>el.remove());image.src=photo.src;image.alt=photo.alt;}
const comparator=$('[data-comparator]'),gallery=$('[data-gallery]');
if(comparator||gallery){
 try{
 const response=await fetch(new URL(`rooms${english?'.en':''}.json`,import.meta.url));if(!response.ok)throw new Error('room data');const rooms=await response.json();
 if(comparator){
   const tabs=$$('[data-room-tab]',comparator);let room=rooms.find(r=>r.id===tabs[0].dataset.roomTab),photoIndex=0;
   const photo=$('.comparator-photo img',comparator),count=$('.photo-count',comparator);
   function displayPhoto(){showPhoto(photo,room.photos[photoIndex]);count.textContent=`${photoIndex+1} / ${room.photos.length}`;}
   function selectRoom(tab){room=rooms.find(r=>r.id===tab.dataset.roomTab);photoIndex=0;tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===tab));t.tabIndex=t===tab?0:-1});$('#selected-room').setAttribute('aria-labelledby',tab.id);$('[data-selected-name]').textContent=room.name;$('.selected-feature').textContent=room.feature;$('[data-selected-beds]').textContent=room.beds;$('[data-selected-description]').textContent=room.description;let items=$$('[data-selected-facts] .room-facts li span');items[0].textContent=`${room.area} ${t('м²','m²')}`;items[1].textContent=t(`до ${room.capacity} гостей`,`up to ${room.capacity} guests`);items[2].textContent=`${room.roomCount} ${t(room.roomCount===1?'комната':'комнаты',room.roomCount===1?'room':'rooms')}`;$$('[data-selected-link],[data-selected-photo-link]').forEach(a=>a.href=`${base}rooms/${room.slug}/`);displayPhoto();}
   tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>selectRoom(tab));tab.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight'||e.key==='ArrowDown')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft'||e.key==='ArrowUp')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;if(n!==undefined){e.preventDefault();selectRoom(tabs[n]);tabs[n].focus();}})});
   $('[data-photo-prev]',comparator).addEventListener('click',()=>{photoIndex=(photoIndex+room.photos.length-1)%room.photos.length;displayPhoto()});$('[data-photo-next]',comparator).addEventListener('click',()=>{photoIndex=(photoIndex+1)%room.photos.length;displayPhoto()});displayPhoto();
 }
 if(gallery){
   const room=rooms.find(r=>r.id===gallery.dataset.gallery);let index=0,opener=null;
   const dialog=$('.lightbox'),mainPhoto=$('.gallery-stage img',gallery),largePhoto=$('.lightbox-image img',dialog),thumbs=$$('[data-photo-index]',gallery);
   function render(){const p=room.photos[index];showPhoto(mainPhoto,p);showPhoto(largePhoto,p);$('.photo-count',gallery).textContent=`${index+1} / ${room.photos.length}`;$('.gallery-caption',gallery).textContent=p.caption;$('[data-lightbox-caption]',dialog).textContent=`${index+1} / ${room.photos.length} · ${p.caption}`;thumbs.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));}
   function move(delta){index=(index+delta+room.photos.length)%room.photos.length;render()}
   thumbs.forEach(b=>b.addEventListener('click',()=>{index=+b.dataset.photoIndex;render()}));
   $('[data-photo-prev]',gallery).addEventListener('click',()=>move(-1));$('[data-photo-next]',gallery).addEventListener('click',()=>move(1));
   function openPhoto(){opener=document.activeElement;render();dialog.showModal();$('[data-gallery-close]',dialog).focus()}
   $('.gallery-open',gallery).addEventListener('click',openPhoto);
   $$('[data-gallery-open-index]',gallery).forEach(button=>button.addEventListener('click',()=>{index=+button.dataset.galleryOpenIndex;openPhoto()}));
   $('[data-gallery-close]',dialog).addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>opener?.focus());
   $('[data-lightbox-prev]',dialog).addEventListener('click',()=>move(-1));$('[data-lightbox-next]',dialog).addEventListener('click',()=>move(1));
   [gallery,dialog].forEach(el=>el.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}}));
   [$('.gallery-stage',gallery),$('.lightbox-image',dialog)].forEach(el=>{let start,swiped=false;el.addEventListener('pointerdown',e=>{swiped=false;if(e.pointerType==='touch'||e.pointerType==='pen')start=[e.clientX,e.clientY]});el.addEventListener('pointerup',e=>{if(start){let dx=e.clientX-start[0],dy=e.clientY-start[1];if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.4){swiped=true;move(dx<0?1:-1)}start=null}});el.addEventListener('pointercancel',()=>{start=null;swiped=false});el.addEventListener('click',e=>{if(swiped){e.preventDefault();e.stopPropagation();swiped=false}},true)});render();
 }
 }catch{const hint=document.createElement('p');hint.className='interaction-error';hint.textContent=t('Не удалось загрузить интерактивную галерею. Обновите страницу; описание и переход к бронированию доступны.','The interactive gallery could not load. Refresh the page; room details and booking links remain available.');(comparator||gallery).after(hint);}
}
const filters=$$('[data-filter]');
if(filters.length){const cards=$$('[data-room-card]');function applyFilters(){const values=Object.fromEntries(filters.map(f=>[f.dataset.filter,f.type==='checkbox'?f.checked:f.value]));let visible=0;cards.forEach(c=>{let show=+c.dataset.capacity>=+values.capacity&&(values.view==='all'||values.view===c.dataset.view)&&(!values.kitchen||c.dataset.kitchen==='true')&&(!values.rooms||+c.dataset.roomCount===2);c.hidden=!show;if(show)visible++});$('[data-result-count]').textContent=visible===cards.length?t(`Показаны все ${cards.length} категорий`,`Showing all ${cards.length} categories`):t(`Найдено категорий: ${visible}`,`${visible} matching categories`);$('[data-no-results]').hidden=visible>0;}filters.forEach(f=>f.addEventListener('change',applyFilters));$$('[data-reset-filters]').forEach(b=>b.addEventListener('click',()=>{filters.forEach(f=>{if(f.type==='checkbox')f.checked=false;else f.selectedIndex=0});applyFilters()}));}
const mobileAction=$('.mobile-room-action');if(mobileAction){new IntersectionObserver(([e])=>mobileAction.classList.toggle('is-at-booking',e.isIntersecting),{threshold:.15}).observe($('.room-booking'));}

const serviceTabs=$$('[data-service-tab]');
function selectService(tab){serviceTabs.forEach(b=>{const active=b===tab;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;$('#'+b.getAttribute('aria-controls')).hidden=!active})}
serviceTabs.forEach((b,i)=>{b.addEventListener('click',()=>selectService(b));b.addEventListener('keydown',e=>{let n;if(['ArrowRight','ArrowDown'].includes(e.key))n=(i+1)%serviceTabs.length;if(['ArrowLeft','ArrowUp'].includes(e.key))n=(i+serviceTabs.length-1)%serviceTabs.length;if(e.key==='Home')n=0;if(e.key==='End')n=serviceTabs.length-1;if(n!==undefined){e.preventDefault();selectService(serviceTabs[n]);serviceTabs[n].focus()}})});


const hotelGallery=$('[data-hotel-gallery]');
if(hotelGallery){try{
 const response=await fetch(new URL(`gallery.${lang}.json`,import.meta.url));if(!response.ok)throw new Error('gallery');const all=await response.json(),isAlbum=hotelGallery.classList.contains('album-grid'),photos=isAlbum?all.slice(0,14):all;
 const dialog=$('.lightbox'),large=$('.lightbox-image img',dialog),caption=$('[data-lightbox-caption]',dialog),buttons=$$('[data-hotel-index]',hotelGallery),filters=$$('[data-gallery-filter]'),roomSelect=$('[data-gallery-room]');let index=0,available=photos.map((p,i)=>i),opener;
 function render(){showPhoto(large,photos[index]);caption.textContent=`${available.indexOf(index)+1} / ${available.length} · ${photos[index].caption}`}
 function move(delta){index=available[(available.indexOf(index)+delta+available.length)%available.length];render()}
 buttons.forEach(b=>b.addEventListener('click',()=>{index=+b.dataset.hotelIndex;opener=b;render();dialog.showModal();$('[data-gallery-close]',dialog).focus()}));
 $('[data-gallery-close]',dialog).addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>opener?.focus());
 $('[data-lightbox-prev]',dialog).addEventListener('click',()=>move(-1));$('[data-lightbox-next]',dialog).addEventListener('click',()=>move(1));
 dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});
 let group='all';function apply(){available=[];buttons.forEach(b=>{const show=(group==='all'||b.dataset.photoGroup===group)&&(roomSelect.value==='all'||b.dataset.photoRoom===roomSelect.value);b.hidden=!show;if(show)available.push(+b.dataset.hotelIndex)});$('[data-gallery-count]').textContent=t(`${available.length} фотографий`,`${available.length} photographs`);filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.galleryFilter===group)))}
 filters.forEach(b=>b.addEventListener('click',()=>{group=b.dataset.galleryFilter;roomSelect.value='all';apply()}));roomSelect?.addEventListener('change',()=>{group=roomSelect.value==='all'?'all':'rooms';apply()});
 const stage=$('.lightbox-image',dialog);let start;stage.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.pointerType==='pen')start=[e.clientX,e.clientY]});stage.addEventListener('pointerup',e=>{if(start){const dx=e.clientX-start[0],dy=e.clientY-start[1];if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.4)move(dx<0?1:-1);start=null}});stage.addEventListener('pointercancel',()=>start=null);
}catch{const p=document.createElement('p');p.className='interaction-error';p.textContent=t('Просмотр на весь экран временно недоступен. Фотографии показаны ниже.','Full-screen viewing is temporarily unavailable. Photographs are shown below.');hotelGallery.before(p)}}
