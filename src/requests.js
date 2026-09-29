const panel=document.querySelector('#service-request');
if(panel){
 const en=document.documentElement.lang==='en',t=(ru,enText)=>en?enText:ru;
 const form=panel.querySelector('form'),result=panel.querySelector('[data-request-result]');
 const names={transfer:t('Заказать трансфер','Arrange a transfer'),visa:t('Визовая поддержка','Visa support'),concierge:t('Помощь консьержа','Concierge assistance'),everyday:t('Пожелания к приезду','Requests for your stay')};
 let service='concierge';
 document.querySelectorAll('[data-request-service]').forEach(button=>button.addEventListener('click',()=>{
  service=button.dataset.requestService;panel.querySelector('h2').textContent=names[service];panel.setAttribute('aria-label',names[service]);
  panel.querySelector('[data-request-intro]').textContent=service==='transfer'?t('Встреча в аэропорту или на вокзале — до дверей отеля. Стоимость поездки согласуем заранее.','From the airport or railway station to the hotel door. The fare is agreed in advance.'):service==='visa'?t('Поможем разобраться с оформлением приглашения перед поездкой.','We can help you prepare for requesting a travel invitation.'):t('Расскажите о планах — поможем с деталями вашего Петербурга.','Tell us your plans — we can help with the details of your stay.');
  form.querySelectorAll('fieldset').forEach(group=>{group.hidden=group.dataset.requestFields!==service;group.disabled=group.hidden;});
  form.hidden=false;result.hidden=true;
 }));
 const date=form.elements.date;const now=new Date();date.min=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
 form.addEventListener('submit',event=>{
  event.preventDefault();if(!form.reportValidity())return;
  const data=new FormData(form),summary=panel.querySelector('[data-request-summary]');summary.replaceChildren();
  const labels={name:t('Гость','Guest'),email:'Email',date:t('Дата','Date'),phone:t('Телефон','Phone'),pickup:t('Откуда','Pick-up'),time:t('Время','Time'),flight:t('Рейс / поезд','Flight / train'),passengers:t('Пассажиры','Passengers'),nationality:t('Гражданство','Nationality'),message:t('Пожелания','Wishes')};
  for(const [key,value] of data){if(!String(value).trim())continue;const term=document.createElement('dt'),detail=document.createElement('dd');term.textContent=labels[key];detail.textContent=value;summary.append(term,detail);}
  form.hidden=true;result.hidden=false;result.focus();
 });
 panel.querySelector('[data-request-edit]').addEventListener('click',()=>{form.hidden=false;result.hidden=true;form.elements.name.focus();});
 panel.addEventListener('close',()=>{form.reset();result.hidden=true;form.hidden=false;});
}
