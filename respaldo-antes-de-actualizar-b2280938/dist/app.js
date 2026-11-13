(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const stage = $('#stage'), music = $('#music'), nav = $('#navigation');
  const initial = structuredClone(window.GARDEN_CONTENT);
  let content = structuredClone(initial), section = 'bienvenida', selectedLetter = 0, memoryIndex = 0;
  let opened = new Set(), entered = false, turning = false, blown = false, showDedication = false;
  let toastTimer, audioContext, db;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 600px)');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 4500); }
  function safeRead(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
  function rememberProgress() { try { localStorage.setItem('maryore-letters', JSON.stringify([...opened])); } catch {} }
  opened = new Set(safeRead('maryore-letters', []).filter(n => Number.isInteger(n) && n >= 0 && n < 8));
  const dbReady = new Promise(resolve => {
    if (!window.indexedDB) return resolve();
    const req = indexedDB.open('nuestro-jardin-maryore', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('gift');
    req.onerror = () => resolve();
    req.onsuccess = () => { db = req.result; const get = db.transaction('gift').objectStore('gift').get('content'); get.onsuccess = () => { if (validContent(get.result)) content = get.result; resolve(); }; get.onerror = () => resolve(); };
  });
  function validContent(c) { return !!c && typeof c.dedication === 'string' && Array.isArray(c.letters) && c.letters.length === 8 && c.letters.every(l => typeof l.title === 'string' && typeof l.text === 'string') && Array.isArray(c.memories) && c.memories.length > 0 && c.memories.length <= 50 && c.memories.every(m => typeof m.title === 'string' && typeof m.description === 'string' && typeof m.photo === 'string' && (!m.photo || /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(m.photo) || /^assets\/[a-zA-Z0-9_./ -]+\.(jpg|jpeg|png|webp)$/i.test(m.photo))); }
  function persist() { return new Promise((resolve, reject) => { if (!db) return reject(new Error('Este navegador no permite guardar. Exporta tus cambios antes de salir.')); const tx = db.transaction('gift', 'readwrite'); tx.objectStore('gift').put(content, 'content'); tx.oncomplete = resolve; tx.onerror = () => reject(new Error('No se pudieron guardar los cambios. Exporta una copia.')); }); }
  const back = () => '<button class="back" data-go="jardin">← Volver al jardín</button>';
  const heading = (title, subtitle) => `<div class="section-head">${back()}<div class="heading"><p class="eyebrow">NUESTRO JARDÍN</p><h1>${title}</h1><p>${subtitle}</p><div class="ornament" aria-hidden="true">— ❀ —</div></div></div>`;
  function welcome() {
    return `<div class="welcome-layout"><div class="welcome-copy"><p class="eyebrow">13 DE NOVIEMBRE · PARA MARYORE</p><h1>Todo esto,<br> <em>por ti.</em></h1><div class="tiny-line"></div><p>Mi cachetitos, preparé un lugar para guardar un poquito de nosotros. Hoy quiero regalártelo.</p><p style="font-family:var(--serif);font-size:22px;margin-top:15px">Con amor, Brayan.</p></div><form id="entryForm" class="entry-card" novalidate><img class="entry-mark" src="assets/lirio.svg" alt=""><h2>Antes de entrar…</h2><p class="intro">Unas pequeñas preguntas para empezar<br>esta página de nuestra historia.</p><label class="field"><span>Tu nombre</span><input name="nombre" autocomplete="given-name" placeholder="¿Quién ilumina este jardín?" maxlength="80"></label><label class="field"><span>¿Dónde nos vimos por primera vez?</span><input name="lugar" placeholder="Ese lugar donde empezó todo" maxlength="150"></label><label class="field"><span>¿Cómo te digo de cariño?</span><input name="apodo" placeholder="Ese nombre que es solo tuyo" maxlength="100"></label><button class="primary" type="submit">Entrar a nuestro jardín <span class="arrow">→</span></button><p class="footnote">No hay respuestas equivocadas.<br>Este regalo siempre será para ti.</p></form></div>`;
  }
  function garden() {
    return `<section class="garden-main"><p class="eyebrow" style="text-align:center">MARYORE, MI CACHETITOS</p><h1>Hay un lugar que hice para ti.</h1><p class="sub">UN JARDÍN DE RECUERDOS, CARTAS Y DESEOS</p><div class="garden-map"><button class="destination letters" data-go="cartas"><span class="hotspot" aria-hidden="true">✉</span><span class="title">Lo que siento</span><small>${opened.size} DE 8 CARTAS ABIERTAS</small></button><button class="destination story" data-go="historia"><span class="hotspot" aria-hidden="true">▧</span><span class="title">Nuestra historia</span><small>LOS RECUERDOS QUE NOS UNEN</small></button><button class="destination birthday" data-go="cumple"><span class="hotspot" aria-hidden="true">♡</span><span class="title">Tu cumpleaños</span><small>HAY UN DESEO ESPERÁNDOTE</small></button></div><p class="garden-note">Qué bonito que existas, Maryore.</p><div class="garden-tools"><button data-go="editor">Preparar el regalo</button><button data-action="restart">Volver a la bienvenida</button></div></section>`;
  }
  function letters() {
    const letter = content.letters[selectedLetter];
    return `${heading('Lo que siento por ti', 'Ocho cartas, ocho pedacitos de mi corazón.')}<div class="letters-layout"><div class="envelopes" role="group" aria-label="Escoge una carta">${content.letters.map((l,i) => `<button class="envelope-button ${i === selectedLetter ? 'active' : ''} ${opened.has(i) ? 'read' : ''}" data-letter="${i}" aria-pressed="${i === selectedLetter}" aria-label="Carta ${i+1}: ${esc(l.title)}${opened.has(i) ? ', leída' : ''}"><span class="envelope" aria-hidden="true"><span class="seal">❀</span></span><span class="caption"><span class="num">${String(i+1).padStart(2,'0')} · </span>${esc(l.title)}</span></button>`).join('')}</div><article class="letter-paper" aria-live="polite"><img class="paper-mark" src="assets/lirio.svg" alt=""><p class="eyebrow">CARTA ${String(selectedLetter+1).padStart(2,'0')} DE 08</p><h2>${esc(letter.title)}</h2><div class="letter-body">${esc(letter.text)}</div><p class="letter-signature">Con amor, Brayan.</p><div class="paper-bottom"><small>${opened.size} de 8 cartas abiertas</small><button class="primary" data-action="next-letter">${selectedLetter === 7 ? 'Volver a la primera' : 'Siguiente carta'} →</button></div></article></div>`;
  }
  function photoMarkup(m) {
    return m.photo ? `<img src="${esc(m.photo)}" alt="${esc(m.title)}">` : `<div class="photo-placeholder"><svg viewBox="0 0 80 60" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><rect x="5" y="5" width="70" height="50" rx="3"/><circle cx="25" cy="20" r="6"/><path d="m6 46 20-17 16 13 12-17 20 21"/></svg><small>UNA FOTO NUESTRA, PRONTO AQUÍ</small></div>`;
  }
  const spreadSize = () => mobile.matches ? 1 : 2;
  function history() {
    const size = spreadSize(); memoryIndex = Math.min(memoryIndex, Math.floor((content.memories.length-1)/size)*size);
    const pages = content.memories.slice(memoryIndex,memoryIndex+size);
    return `${heading('Nuestra historia', 'Hay recuerdos que merecen quedarse para siempre.')}<div class="album-wrap"><p class="album-progress">RECUERDOS ${memoryIndex+1}${pages.length > 1 ? '–'+(memoryIndex+pages.length) : ''} DE ${content.memories.length}</p><div class="album" aria-live="polite">${pages.map((m,i) => `<article class="album-page"><div class="photo-frame">${photoMarkup(m)}</div><h2>${esc(m.title)}</h2><p>${esc(m.description)}</p><div class="page-number">— ${memoryIndex+i+1} —</div></article>`).join('')}${size===2 && pages.length===1 ? '<div class="album-page"><h2>Continuará…</h2><p>Nos quedan muchas páginas por escribir.</p></div>' : ''}</div><div class="album-controls"><button class="round" data-action="prev-memory" ${memoryIndex === 0 ? 'disabled' : ''} aria-label="Página anterior">‹</button><span>Página ${Math.floor(memoryIndex/size)+1} de ${Math.ceil(content.memories.length/size)}</span><button class="round" data-action="next-memory" ${memoryIndex+size >= content.memories.length ? 'disabled' : ''} aria-label="Página siguiente">›</button></div><div class="editor-link"><button class="text-button" data-go="editor">Preparar mis fotos y dedicatorias</button></div></div>`;
  }
  function birthday() {
    return `${heading('Hoy celebramos tu vida', '13 de noviembre · Un deseo solo para ti')}<div class="birthday-layout"><div class="cake-scene ${blown ? 'blown' : ''}" aria-label="Torta con cinco velitas ${blown ? 'apagadas' : 'encendidas'}"><div class="candles" aria-hidden="true">${Array.from({length:5},()=>'<span class="candle"><i class="flame"></i></span>').join('')}</div><div class="cake-body" aria-hidden="true"><div class="icing"></div><span class="cake-monogram">Maryore</span><img class="cake-lily" src="assets/lirio.svg" alt=""></div><div class="cake-plate"></div><div class="cake-stand"></div><div class="cake-base"></div><div class="cake-caption">Para ti, mi cachetitos.</div></div><section class="birthday-card" aria-live="polite">${!blown ? '<span class="cake-spark" aria-hidden="true">✧</span><p class="eyebrow">ESTE MOMENTO ES TUYO</p><h2>Cierra los ojos.<br>Pide un deseo.</h2><p>Que este nuevo año te regale cosas tan bonitas como las que tú haces sentir.</p><button class="primary" data-action="blow">Apagar las velitas <span class="arrow">♡</span></button><p class="wish-note">Tócalas cuando estés lista.</p>' : showDedication ? `<p class="eyebrow">DE BRAYAN, PARA TI</p><h2>Feliz cumpleaños,<br>mi amor.</h2><p class="dedication">${esc(content.dedication)}</p><button class="text-button" data-action="relight">Volver a encender las velitas</button>` : '<span class="cake-spark" aria-hidden="true">♡</span><h2>¡Feliz cumpleaños,<br>Maryore!</h2><p>Que tu deseo encuentre la forma de hacerse realidad. Todavía hay unas palabras que quiero regalarte…</p><div class="bday-options"><button class="primary" data-action="dedication">Leer mi dedicatoria →</button><button class="text-button" data-action="relight">Volver a encender las velitas</button></div>'}</section></div>`;
  }
  function editor() {
    return `${heading('Preparar el regalo', 'Aquí puedes poner sus fotos y escribir con tu propia voz.')}<section class="editor"><h2>Un recuerdo más</h2><p>Las fotos y los textos se guardan en este navegador. Para llevarlos a otro dispositivo, exporta una copia e impórtala allí. Para incluirlos en la página compartida, descarga content.js y reemplaza ese archivo en el proyecto antes de publicarlo.</p><form id="memoryForm"><label>Foto de ustedes<input id="photoInput" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required></label><label>Título del recuerdo<input name="title" maxlength="100" placeholder="Por ejemplo: Nuestra primera salida" required></label><label>Una pequeña descripción<textarea name="description" maxlength="1500" placeholder="¿Qué pasó ese día? ¿Qué sentiste?" required></textarea></label><button class="primary" type="submit">Guardar recuerdo</button></form><div class="actions"><button class="secondary" data-action="export">Exportar copia</button><label class="secondary">Importar copia<input class="sr-only" id="importFile" type="file" accept="application/json,.json"></label><button class="secondary" data-action="download-content">Descargar content.js</button></div><details><summary>Editar las fotos y los recuerdos actuales (${content.memories.length})</summary>${content.memories.map((m,i)=>`<form class="memory-edit letter-edit" data-index="${i}"><label>Título<input name="title" value="${esc(m.title)}" required maxlength="100"></label><label>Descripción<textarea name="description" maxlength="1500" required>${esc(m.description)}</textarea></label><label>Cambiar foto (opcional)<input name="photo" type="file" accept="image/jpeg,image/png,image/webp"></label><div class="actions"><button class="primary">Guardar cambios</button><button type="button" class="secondary" data-remove-memory="${i}" ${content.memories.length===1?'disabled':''}>Eliminar recuerdo</button></div></form>`).join('')}</details><details><summary>Personalizar las ocho cartas</summary><p>Los textos iniciales son borradores. Cámbialos por tus propias palabras antes de entregar el regalo.</p>${content.letters.map((l,i)=>`<form class="letter-edit" data-edit-letter="${i}"><label>Carta ${i+1} · Título<input name="title" maxlength="100" required value="${esc(l.title)}"></label><label>Tu mensaje<textarea name="text" required maxlength="5000">${esc(l.text)}</textarea></label><button class="primary">Guardar carta</button></form>`).join('')}</details><details><summary>Editar la dedicatoria de cumpleaños</summary><form id="dedicationForm"><label>Tu dedicatoria<textarea name="text" required maxlength="6000">${esc(content.dedication)}</textarea></label><button class="primary">Guardar dedicatoria</button></form></details></section>`;
  }
  function render(focus = false) {
    document.body.className = section === 'bienvenida' ? 'welcome' : section === 'jardin' ? 'garden' : 'interior';
    nav.hidden = !entered;
    stage.innerHTML = ({bienvenida:welcome,jardin:garden,cartas:letters,historia:history,cumple:birthday,editor})[section]();
    nav.querySelectorAll('button').forEach(b => { b.classList.toggle('active',b.dataset.go===section); if(b.dataset.go===section) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); });
    document.title = `${({bienvenida:'Para Maryore',jardin:'Nuestro jardín',cartas:'Tus cartas',historia:'Nuestra historia',cumple:'Feliz cumpleaños',editor:'Preparar el regalo'})[section]} · Maryore y Brayan`;
    if(focus) { stage.focus({preventScroll:true}); window.scrollTo({top:0,behavior:'instant'}); }
  }
  function paperSound() {
    if(music.paused || reduceMotion.matches) return;
    try { audioContext ??= new (window.AudioContext || window.webkitAudioContext)(); audioContext.resume(); const buffer=audioContext.createBuffer(1,audioContext.sampleRate*.22,audioContext.sampleRate); const data=buffer.getChannelData(0); for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/data.length); const noise=audioContext.createBufferSource();noise.buffer=buffer;const filter=audioContext.createBiquadFilter();filter.type='bandpass';filter.frequency.value=1800;const gain=audioContext.createGain();gain.gain.value=.045;noise.connect(filter).connect(gain).connect(audioContext.destination);noise.start(); }catch{}
  }
  async function navigate(target, {reverse=false,force=false} = {}) {
    if(turning || !['bienvenida','jardin','cartas','historia','cumple','editor'].includes(target)) return;
    if(!entered && target!=='bienvenida') return;
    if(target===section&&!force) return;
    const change=()=>{section=target;if(target==='cartas'){opened.add(selectedLetter);rememberProgress();}render(true);};
    if(reduceMotion.matches){change();return;}
    turning=true;paperSound();const page=$('#pageTurn');page.className='page-turn turning'+(reverse?' reverse':'');
    await new Promise(r=>setTimeout(r,450));change();
    await new Promise(r=>setTimeout(r,550));page.className='page-turn';turning=false;
  }
  function updateMusic() { const playing=!music.paused;$('#musicButton').setAttribute('aria-pressed',String(playing));$('#musicButton').setAttribute('aria-label',playing?'Pausar nuestra canción':'Reproducir nuestra canción');$('#playIcon').textContent=playing?'Ⅱ':'▷'; }
  async function playMusic(){try{await music.play();}catch{toast('Toca «Nuestra canción» para activar la música.');}updateMusic();}
  music.volume=.55;music.addEventListener('play',updateMusic);music.addEventListener('pause',updateMusic);music.addEventListener('error',()=>toast('No se pudo cargar la canción. Revisa que esté el MP3 en assets.'));
  $('#musicButton').addEventListener('click',()=>music.paused?playMusic():music.pause());
  document.addEventListener('submit',async e=>{
    e.preventDefault();const form=e.target;const data=new FormData(form);
    if(form.id==='entryForm'){entered=true;playMusic();navigate('jardin');return;}
    try {
      if(form.id==='memoryForm'){
        if(content.memories.length>=50) return toast('Puedes guardar hasta 50 recuerdos.');
        const photo=await readPhoto(data.get('photo'));const m={title:String(data.get('title')).trim(),description:String(data.get('description')).trim(),photo};
        if(!m.title||!m.description) return toast('Añade un título y una descripción.');
        content.memories.push(m);await persist();render();toast('Recuerdo guardado. Exporta una copia para conservarlo.');
      } else if(form.matches('.memory-edit')){
        const i=Number(form.dataset.index),file=data.get('photo');const updated={title:String(data.get('title')).trim(),description:String(data.get('description')).trim(),photo:content.memories[i].photo};
        if(file?.size) updated.photo=await readPhoto(file);content.memories[i]=updated;await persist();toast('Recuerdo actualizado.');
      } else if(form.hasAttribute('data-edit-letter')){
        content.letters[Number(form.dataset.editLetter)]={title:String(data.get('title')).trim(),text:String(data.get('text')).trim()};await persist();toast('Carta guardada con tus palabras.');
      } else if(form.id==='dedicationForm'){content.dedication=String(data.get('text')).trim();await persist();toast('Dedicatoria guardada.');}
    } catch(err){toast(err.message || 'No se pudo guardar. Intenta con una foto más pequeña.');}
  });
  function readPhoto(file){return new Promise((resolve,reject)=>{if(!file?.size)return reject(new Error('Escoge una foto.'));if(!['image/jpeg','image/png','image/webp'].includes(file.type))return reject(new Error('Usa una foto JPG, PNG o WebP.'));if(file.size>15*1024*1024)return reject(new Error('La foto debe pesar menos de 15 MB.'));const reader=new FileReader();reader.onerror=()=>reject(new Error('No se pudo leer la foto.'));reader.onload=()=>{const img=new Image();img.onerror=()=>reject(new Error('No se pudo abrir esa imagen.'));img.onload=()=>{const scale=Math.min(1,1400/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.86));};img.src=reader.result;};reader.readAsDataURL(file);});}
  function download(name,body,type){const url=URL.createObjectURL(new Blob([body],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}
  async function pageMemory(delta){if(turning)return;const next=memoryIndex+delta*spreadSize();if(next<0||next>=content.memories.length)return;paperSound();if(!reduceMotion.matches){turning=true;$('.album').classList.add('page-flip');await new Promise(r=>setTimeout(r,300));}memoryIndex=next;render();turning=false;}
  document.addEventListener('click',async e=>{
    const go=e.target.closest('[data-go]');if(go){e.preventDefault();navigate(go.dataset.go,{reverse:go.dataset.go==='jardin'});return;}
    const brand=e.target.closest('.brand');if(brand){e.preventDefault();if(entered)navigate('jardin',{reverse:true});return;}
    const letter=e.target.closest('[data-letter]');if(letter){selectedLetter=Number(letter.dataset.letter);opened.add(selectedLetter);rememberProgress();paperSound();render();return;}
    const remove=e.target.closest('[data-remove-memory]');if(remove){if(content.memories.length<=1)return;content.memories.splice(Number(remove.dataset.removeMemory),1);try{await persist();render();toast('Recuerdo eliminado.');}catch(err){toast(err.message);}return;}
    const action=e.target.closest('[data-action]')?.dataset.action;
    if(action==='next-letter'){selectedLetter=(selectedLetter+1)%8;opened.add(selectedLetter);rememberProgress();paperSound();render();}
    if(action==='next-memory')pageMemory(1);if(action==='prev-memory')pageMemory(-1);
    if(action==='blow'){blown=true;render();celebrate();}
    if(action==='relight'){blown=false;showDedication=false;render();}
    if(action==='dedication'){showDedication=true;render();}
    if(action==='restart'){entered=false;navigate('bienvenida',{reverse:true});}
    if(action==='export')download('nuestro-jardin-recuerdos.json',JSON.stringify(content,null,2),'application/json');
    if(action==='download-content')download('content.js','window.GARDEN_CONTENT = '+JSON.stringify(content,null,2)+';\n','text/javascript');
  });
  document.addEventListener('change',async e=>{if(e.target.id!=='importFile')return;const file=e.target.files[0];if(!file)return;try{if(file.size>60*1024*1024)throw new Error('La copia es demasiado grande.');const parsed=JSON.parse(await file.text());if(!validContent(parsed))throw new Error('Esta copia no tiene el formato del jardín.');content=parsed;await persist();memoryIndex=0;render();toast('Fotos y textos importados.');}catch(err){toast(err.message);}});
  function celebrate(){if(reduceMotion.matches)return;const box=$('#confetti');box.replaceChildren();for(let i=0;i<65;i++){const c=document.createElement('i');c.className='confetto';c.style.setProperty('--left',Math.random()*100+'vw');c.style.setProperty('--duration',(3+Math.random()*3)+'s');c.style.setProperty('--delay',Math.random()*.7+'s');c.style.setProperty('--confetti-color',['#e5c08d','#d6a0a8','#eee3c6','#a7c1ad'][i%4]);box.append(c);}setTimeout(()=>box.replaceChildren(),7000);}
  for(let i=0;i<12;i++){const f=document.createElement('i');f.className='firefly';f.style.left=(5+Math.random()*90)+'%';f.style.top=(35+Math.random()*55)+'%';f.style.animationDelay=(-Math.random()*10)+'s';$('#fireflies').append(f);}
  mobile.addEventListener('change',()=>{if(section==='historia'){memoryIndex=Math.floor(memoryIndex/spreadSize())*spreadSize();render();}});
  dbReady.then(()=>{render();if(new URLSearchParams(location.search).get('preparar')==='1'){entered=true;section='editor';render();}});
})();
