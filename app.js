(() => {
  'use strict';
  const C = window.FRUIT_CONTENT;
  const M = window.DecimalMath;
  if (!C || !M) { document.getElementById('app').textContent = 'The lesson could not load. Keep all website files in the same folder.'; return; }
  const $ = (s) => document.querySelector(s);
  const esc = M.escapeHTML;
  const state = {step:0, extra:false, transferOpen:false, transferAnswer:false, diagram:false, representation:'full', hint:false, answer:false, selectedShop:null, ribbon:false, level:'basic', question:null, questionHint:false, questionAnswer:false, speech:'', voice:false, draft:'', purpose:'', example:null, error:'', visited:new Set()};
  const steps = [{title:'Welcome',label:'Visit the shop'},{title:'Task 1',label:'Explain a price'},{title:'Task 2',label:'Choose a shop'},{title:'Task 3',label:'Decimals in life'},{title:'Practice',label:'After-class practice'}];
  const fruit = () => C.fruits[0];
  const amount = () => fruit().prices.original;
  const practice = window.FruitPractice.create(C.practice);
  document.getElementById('transfer-teacher-price').textContent=C.transfer.name+' at '+M.price(C.transfer.amount)+' yuan';
  const interpolate = (s) => {
    const a=amount(), whole=Math.floor(a/10), tenths=a%10;
    return String(s||'').replaceAll('{price}',M.price(a)).replaceAll('{whole}',String(whole)).replaceAll('{tenths}',String(tenths));
  };
  const art = (id,cls='fruit-art') => `<svg class="${cls}" viewBox="0 0 220 160" role="img" aria-label="${id==='apple'?'Apple':id==='orange'?'Orange':'Pear'} illustration"><ellipse cx="110" cy="144" rx="66" ry="9" fill="#235d4c" opacity=".07"/>${id==='apple'?'<path d="M111 42c-10-17-33-21-51-10-30 18-26 55-10 82 13 23 31 34 51 25 7-3 13-3 20 0 20 9 38-2 51-25 16-27 20-64-10-82-18-11-41-7-51 10z" fill="#d97555"/><path d="M111 44c-3-17 0-26 8-34" fill="none" stroke="#72523c" stroke-width="8" stroke-linecap="round"/><path d="M119 23c14-21 35-19 43-8-11 14-28 20-43 8z" fill="#63876a"/><path d="M64 56c-12 12-15 25-12 38" stroke="#f3b291" stroke-width="8" fill="none" stroke-linecap="round"/>':id==='orange'?'<circle cx="110" cy="85" r="58" fill="#eda64d"/><path d="M111 30c-1-10 0-17 4-24" stroke="#71563c" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M115 21c15-18 36-15 42-4-12 12-26 14-42 4z" fill="#63876a"/><path d="M72 55c-12 8-17 18-18 31" stroke="#f7cf87" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="137" cy="94" r="2" fill="#d88c34"/><circle cx="149" cy="78" r="2" fill="#d88c34"/><circle cx="127" cy="117" r="2" fill="#d88c34"/>':'<path d="M92 35c-5 27-9 35-24 50-30 33-13 60 40 60 54 0 74-27 43-60-15-16-20-27-23-50-3-23-32-23-36 0z" fill="#c8cd70"/><path d="M108 21c-1-9 3-16 9-21" stroke="#72523c" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M118 17c17-16 34-12 39-2-13 10-25 12-39 2z" fill="#63876a"/><path d="M82 87c-14 15-18 26-9 37" stroke="#e5e7a6" stroke-width="8" fill="none" stroke-linecap="round"/>'}</svg>`;
  const keeper = () => `<svg class="keeper-portrait" viewBox="0 0 140 140" role="img" aria-label="Mr Lin, the cartoon shopkeeper in a green apron"><circle cx="70" cy="70" r="68" fill="#e9eee1"/><path d="M24 140c1-36 18-49 46-49s45 13 46 49" fill="#d4a985"/><path d="M45 104l10-10h30l10 10 9 36H36z" fill="#356755"/><path d="M52 99v22h36V99" fill="none" stroke="#f9f6eb" stroke-width="5"/><ellipse cx="70" cy="59" rx="33" ry="39" fill="#efc8a2"/><path d="M37 57c-3-34 15-45 34-45 27 0 37 17 33 44-11-1-18-11-22-21-11 15-28 19-45 22z" fill="#4e5141"/><path d="M39 34h65l-6-18H45z" fill="#356755"/><path d="M30 34h80" stroke="#356755" stroke-width="9" stroke-linecap="round"/><path d="M58 62h1m22 0h1" stroke="#4a4537" stroke-width="4" stroke-linecap="round"/><path d="M61 78q9 8 18 0" fill="none" stroke="#a4624d" stroke-width="3" stroke-linecap="round"/><circle cx="49" cy="73" r="5" fill="#e9a795" opacity=".7"/><circle cx="91" cy="73" r="5" fill="#e9a795" opacity=".7"/></svg>`;
  function announce(text){ $('#announcement').textContent=''; requestAnimationFrame(()=>{$('#announcement').textContent=text;}); }
  const speech = window.FruitSpeech.create({
    synth: window.speechSynthesis, Utterance: window.SpeechSynthesisUtterance,
    onStatus(message){
      $('#voice-status').textContent=message;
      const visible=$('#voice-message'); if(visible)visible.textContent=message;
    }
  });
  function stop(){speech.stop();}
  function speak(text){if(state.voice)speech.speak(text);else stop();}
  function say(text){state.speech=interpolate(text);renderGuide();speak(state.speech);}
  function clearTask(){state.diagram=false;state.representation='full';state.transferOpen=false;state.transferAnswer=false;state.hint=false;state.answer=false;state.selectedShop=null;state.ribbon=false;state.level='basic';state.question=null;state.questionHint=false;state.questionAnswer=false;state.error='';}
  function go(step){
    stop();state.step=step;clearTask();if(step)state.visited.add(step);
    state.speech=step===4?practice.guide():step?interpolate(C.tasks[step].opening):'Welcome! Let us explain the decimals on price tags, then find decimals in everyday life.';
    history.replaceState(null,'',step===4?'#practice':'#task-'+step);
    render();speak(state.speech);(document.getElementById('stage-title')||document.getElementById('practice-question-title'))?.focus({preventScroll:true});window.scrollTo({top:0});
  }
  function moneyBars(a){
    const {whole,tenths}=M.decompose(a);
    const rows=[];
    for(let i=0;i<whole+(tenths>0?1:0);i++){
      const count=i<whole?10:tenths;
      rows.push(`<div class="bar-row"><span class="bar-label">1 yuan</span><div class="money-bar" role="img" aria-label="One bar represents 1 yuan in 10 equal parts, with ${count} parts shaded">${Array.from({length:10},(_,j)=>`<span class="tenth${j<count?' filled':''}"></span>`).join('')}</div></div>`);
    }
    return `<div class="bar-stack">${rows.join('')}</div><p class="unit-label">Each bar is <strong>1 yuan</strong> in 10 equal parts. Each cell is <strong>0.1 yuan = 1 jiao</strong>.</p>`;
  }
  function intro(){return `<section class="stage-area intro-stage"><div class="stage-card intro-grid"><div class="intro-copy"><p class="eyebrow">20 minutes to explore decimals</p><h2 id="stage-title" class="intro-title" tabindex="-1">Small decimals.<br><span>Everyday uses.</span></h2><p class="lead">What does 2.3 yuan on a price tag mean?<br>Join Mr Lin to explain, compare and explore.</p><button type="button" class="primary-button" data-action="start">Visit the fruit shop <span aria-hidden="true">→</span></button></div><div class="intro-art" aria-hidden="true"><div class="market-awning"></div><div class="shop-sign">Fresh today · Welcome!</div><div class="intro-fruits">${art('apple')}${art('orange')}${art('pear')}</div><div class="intro-ticket"><span>One bag of apples</span><strong>2.3 <small>yuan</small></strong></div><div class="market-shelf"></div></div></div><div class="goal-list"><div class="goal-item"><span class="goal-number">01</span><p>Explain a price</p></div><div class="goal-item"><span class="goal-number">02</span><p>Explain your choice</p></div><div class="goal-item"><span class="goal-number">03</span><p>Connect with your life</p></div></div></section>`;}
  function transferTask(){
    const t=C.transfer;
    if(!M.validTransfer(t.amount))return '<div class="stage-card"><p>Go back to the apples and explain the price.</p><button class="secondary-button" data-action="transfer-close">Back to the apples</button></div>';
    return `<div class="stage-card transfer-panel"><p class="eyebrow">A new fruit, the same rule</p><div class="transfer-price">${art(t.fruitId)}<div><span>${esc(t.name)} · 1 ${esc(t.unit)}</span><strong>${M.price(t.amount)} yuan</strong></div></div><p>Explain first: how many whole yuan, and how many 0.1-yuan parts?</p>${moneyBars(t.amount)}<div class="task-actions"><button type="button" class="primary-button" data-action="transfer-answer">Check</button><button type="button" class="quiet-button" data-action="transfer-close">Back to the apples</button></div>${state.transferAnswer?`<div class="answer-box" role="status">${esc(M.composition(t.amount))}</div>`:''}</div>`;
  }
  function taskOne(){
    if(state.transferOpen)return transferTask();
    const f=fruit(),a=amount(),mode=state.representation;
    const controls=state.diagram?`<div class="representation-controls"><span class="muted">Teacher view</span><div class="segmented" role="group" aria-label="Task 1 display stages">${[['full','Full scene'],['bars','Bars and decimal'],['number','Decimal only']].map(([id,label])=>`<button type="button" data-action="representation" data-value="${id}" class="${mode===id?'active':''}" aria-pressed="${mode===id}">${label}</button>`).join('')}</div><p class="representation-note">Connect the picture and number, then gradually hide the picture. Restore the scene whenever needed.</p></div>`:'';
    const context=mode==='full'?`<div class="market-controls"><span class="muted">Tap the price tag to explore the amount</span></div><div class="fruit-grid core-only"><button type="button" class="fruit-card selected" data-action="fruit" aria-label="Apples, 2.3 yuan per bag. Tap to see the unit bars.">${art(f.id)}<span class="fruit-name">${esc(f.name)} <small>per ${esc(f.unit)}</small></span><span class="price-ticket"><strong class="price-number">${M.price(a)}</strong><span class="price-unit">yuan</span></span><span class="fruit-caption">Tap the price tag to see the bars</span></button></div>`:'';
    const diagram=mode==='number'?'<p class="number-prompt">Can you explain this amount without the picture?</p>':state.diagram?moneyBars(a):'<div class="empty-state"><span class="mini-bars" aria-hidden="true"><i></i><i></i><i></i></span><p>Share your ideas first. Then tap the price tag to see the unit bars.</p></div>';
    const transfer=state.extra&&mode==='number'&&M.validTransfer(C.transfer.amount)?'<div class="transfer-entry"><button type="button" class="secondary-button" data-action="transfer-open">Does the rule work for another fruit?</button></div>':'';
    return `<div class="stage-card">${controls}${context}<div class="representation${mode==='number'?' number-only':''}"><h3>${mode==='full'?`${esc(f.name)} per ${esc(f.unit)} `:''}<span class="accent-number">${M.price(a)} yuan</span></h3>${diagram}</div><div class="task-actions"><button type="button" class="secondary-button" data-action="hint">Hint</button><button type="button" class="quiet-button" data-action="answer">Check the parts</button></div>${state.hint?`<div class="hint-box" role="status">${esc(interpolate(C.tasks[1].hint))}</div>`:''}${state.answer?`<div class="answer-box" role="status">${esc(M.composition(a))}</div>`:''}${transfer}</div>`;
  }
  function priceDifference(){
    return `<div class="difference-diagram"><p>Both prices have 2 whole yuan. Compare the parts smaller than 1 yuan:</p>${[{label:'Shop A: 3 jiao',count:3},{label:'Shop B: 8 jiao',count:8}].map(row=>`<div class="difference-row"><span class="difference-label">${row.label}</span><div class="difference-bar" role="img" aria-label="1 yuan in 10 equal parts, with ${row.count} parts shaded">${Array.from({length:10},(_,i)=>`<span class="difference-cell${i<3?' common':i<row.count?' difference':''}"></span>`).join('')}</div></div>`).join('')}<p>Each whole bar is 1 yuan. Each cell is 0.1 yuan = 1 jiao. The 5 orange cells show the extra 5 jiao.</p></div>`;
  }
  function taskTwo(){return `<div class="stage-card"><p class="shop-condition"><span class="badge">A fair comparison</span> Same variety, quality and amount of apples in each bag. Compare only the price.</p><div class="comparison-grid">${[{id:'A',name:'Mr Lin Fruit Shop',price:23},{id:'B',name:'Corner Fruit Shop',price:28}].map(v=>`<button type="button" class="shop-card${state.selectedShop===v.id?' selected':''}" data-action="shop" data-value="${v.id}" aria-pressed="${state.selectedShop===v.id}"><span class="shop-label">Shop ${v.id} · ${v.name}</span>${art('apple')}<span class="shop-price">${M.price(v.price)}<small>yuan</small></span><span class="shop-pack">The same amount in each bag</span><span class="shop-select-label">${state.selectedShop===v.id?'Selected · Explain why':'Choose this shop'}</span></button>`).join('')}</div>${state.selectedShop?`<div class="choice-prompt" role="status">You chose Shop ${state.selectedShop}. Explain first: how did you compare the prices?</div>`:'<p class="choice-prompt">Choose a shop, then use the prices to explain why.</p>'}<div class="task-actions"><button type="button" class="secondary-button" data-action="hint">Hint</button><button type="button" class="quiet-button" data-action="answer" ${!state.selectedShop?'disabled':''}>Check the choice and saving</button></div>${state.hint?`<div class="hint-box" role="status">${esc(C.tasks[2].hint)}</div>`:''}${state.answer?`<div class="answer-box" role="status"><p class="equation">2.3 yuan <span>＜</span> 2.8 yuan</p><strong>Choose Shop A to save 5 jiao.</strong>${priceDifference()}</div>`:''}</div>`;}
  function taskThree(){return `<div class="stage-card"><div class="ribbon-wrap"><div class="board-tools"><h3>How long is 0.7 m of ribbon?</h3><span class="badge">The whole ribbon is 1 m</span></div><div class="ribbon" role="img" aria-label="A 1-metre ribbon in 10 equal parts${state.ribbon?', with 7 parts shaded to show 0.7 m':', with 0.7 m not yet marked'}">${Array.from({length:10},(_,i)=>`<span class="ribbon-part${state.ribbon&&i<7?' filled':''}"></span>`).join('')}</div><div class="ruler-labels"><span>0</span><span>1 m</span></div><p class="ribbon-caption">Divide 1 m into 10 equal parts. Each part is 0.1 m. Which section would you point to?</p><div class="task-actions"><button type="button" class="secondary-button" data-action="ribbon">${state.ribbon?'Clear the shading':'Mark 0.7 m'}</button><button type="button" class="quiet-button" data-action="hint">Hint</button><button type="button" class="quiet-button" data-action="answer">Check the length</button></div>${state.hint?`<div class="hint-box" role="status">${esc(C.tasks[3].hint)}</div>`:''}${state.answer?'<div class="answer-box" role="status">0.7 m is seven 0.1-metre parts, or seven tenths of a metre. The unit here is metres.</div>':''}</div><form class="reflection-form" id="reflection-form" novalidate><div class="reflection-heading"><span class="badge">Everyone has an example</span><h3>Decimals in your life</h3></div><p>First write your own example on the worksheet. Then share it. The teacher can display one example here, without a name.</p><label for="decimal-example">Where have I seen a decimal? What does it mean?</label><textarea id="decimal-example" maxlength="160" rows="2" placeholder="For example: I saw ... . The number ... means ... ." required>${esc(state.draft)}</textarea><label for="decimal-purpose">How does knowing this number help me?</label><textarea id="decimal-purpose" maxlength="160" rows="2" placeholder="It helps me ... ." required>${esc(state.purpose)}</textarea><div class="form-actions"><span class="field-note">No names needed. Discuss the example with your teacher and classmates.</span><button type="submit" class="primary-button">Display and discuss</button></div>${state.error?`<p class="field-error" role="alert">${esc(state.error)}</p>`:''}</form>${state.example?`<div class="example-card" role="status"><span class="eyebrow">Our everyday example</span><p>${esc(state.example.example)}</p><p><strong>How it helps: </strong>${esc(state.example.purpose)}</p><small>Discuss: are the amount and unit clear?</small></div>`:''}</div>`;}
  function renderGuide(){
    let aside=$('.guide-panel');if(!aside)return;
    const prior=aside.contains(document.activeElement)?{action:document.activeElement.dataset.action,value:document.activeElement.dataset.value}:null;
    const task=state.transferOpen?null:C.tasks[state.step];
    const qs=task?.questions[state.level]||[];
    const q=state.question==null?null:qs[state.question];
    aside.innerHTML=`<section class="shopkeeper-card"><div class="keeper-head">${keeper()}<div><p class="eyebrow">Your fruit shop guide</p><h3 class="keeper-name">Mr Lin</h3><span class="muted">Listen and think together</span></div></div><div class="speech-bubble" aria-live="polite">${esc(state.speech)}</div><p class="voice-message" id="voice-message" role="status">${esc(speech.status())}</p><div class="speech-actions"><button type="button" class="quiet-button" data-action="replay">Listen again</button><button type="button" class="quiet-button" data-action="stop">Stop</button></div></section>${task?`<section class="question-bank"><div class="question-heading"><h3>Think a little further</h3><span class="muted">Think first, then open</span></div><div class="level-tabs" role="group" aria-label="Question levels">${[['basic','Explore'],['apply','Apply'],['extend','Extend']].map(([id,name])=>`<button type="button" data-action="level" data-value="${id}" class="${state.level===id?'active':''}" aria-pressed="${state.level===id}">${name}</button>`).join('')}</div><div class="question-list">${qs.map((v,i)=>`<button type="button" class="question-card${state.question===i?' active':''}" data-action="question" data-value="${i}" aria-expanded="${state.question===i}">${esc(interpolate(v.q))}<span aria-hidden="true">${state.question===i?'−':'+'}</span></button>`).join('')}</div>${q?`<div class="question-reveal"><div class="task-actions"><button type="button" class="quiet-button" data-action="question-hint">Show a hint</button><button type="button" class="quiet-button" data-action="question-answer">Show the answer</button></div>${state.questionHint?`<p class="hint-box">${esc(interpolate(q.hint))}</p>`:''}${state.questionAnswer?`<p class="question-answer" role="status">${esc(interpolate(q.answer))}</p>`:''}</div>`:''}<button type="button" class="fallback-button" data-action="fallback">Another question?</button></section>`:state.step===4?'<section class="question-bank"><h3>Think, then choose</h3><p>Need another try? Read the hint, then choose again. You have up to two tries per question.</p><p>Each correct answer lights one 0.1-yuan cell. Refresh starts again. No results are saved.</p></section>':state.transferOpen?'<section class="question-bank"><h3>Use the rule with a new price</h3><p>Explain the whole yuan, then the part smaller than 1 yuan. Check after you explain.</p></section>':'<section class="question-bank"><p class="eyebrow">Our learning promise</p><h3>Share your thinking first.</h3><p>Look at the picture. Think, then explain your reason to the class.</p><p class="muted">Every choice has a reason to discuss.</p></section>'}`;
    if(prior?.action)Array.from(aside.querySelectorAll('[data-action]')).find(el=>el.dataset.action===prior.action&&el.dataset.value===prior.value)?.focus({preventScroll:true});
  }
  function render(){
    const prior={action:document.activeElement?.dataset.action,value:document.activeElement?.dataset.value};
    $('#lesson-nav').innerHTML=steps.map((s,i)=>`<button type="button" class="step-tab${state.step===i?' active':''}" data-action="step" data-value="${i}" ${state.step===i?'aria-current="step"':''}><span class="step-number">${i===0?'Start':String(i).padStart(2,'0')}</span><span class="step-label">${s.label}</span></button>`).join('');
    const title=state.step===4?'After-class practice':state.step?C.tasks[state.step].title:'';
    const subtitle=state.step===4?'8–10 minutes to use what you learned':state.step?C.tasks[state.step].subtitle:'';
    const header=state.step&&state.step!==4?`<div class="stage-header"><p class="eyebrow">${steps[state.step].title} / Exploring decimals</p><h2 id="stage-title" tabindex="-1">${esc(title)}</h2><p class="lead">${esc(subtitle)}</p></div>`:'';
    $('#app').innerHTML=(state.step?`<section class="stage-area">${header}${state.step===4?practice.render():[null,taskOne,taskTwo,taskThree][state.step]()}</section>`:intro())+'<aside class="guide-panel" aria-label="Shopkeeper and guided questions"></aside>';
    renderGuide();
    $('#lesson-footer').innerHTML=state.step===4?'<div class="lesson-status">Practice · No results saved · Refresh starts again</div><button type="button" class="quiet-button" data-action="step" data-value="3">← Back to the lesson</button>':`<div class="lesson-status"><span class="status-dot"></span>${state.step?`Task ${state.step} of 3 · ${steps[state.step].label}`:'Explain a price, make a choice, then connect it to life.'}</div><div class="footer-actions">${state.step?'<button type="button" class="quiet-button" data-action="previous">← Back</button>':''}<button type="button" class="primary-button" data-action="${state.step===3?'summary':'next'}" ${state.step===3&&!state.example?'disabled title="First add an everyday example and explain how it helps."':''}>${state.step===0?'Start learning':state.step===3?'Review our learning':'Next task →'}</button></div>`;
    $('#voice-toggle').textContent=state.voice?'Read aloud: on':'Read aloud: off';$('#voice-toggle').setAttribute('aria-pressed',String(state.voice));
    if(prior.action)Array.from(document.querySelectorAll('[data-action]')).find(el=>el.dataset.action===prior.action&&el.dataset.value===prior.value)?.focus({preventScroll:true});
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-action]');if(!b)return;
    if(b.tagName==='A')e.preventDefault();
    const action=b.dataset.action,val=b.dataset.value;
    if(action==='home'){go(0);return;}
    if(action==='step'){go(Number(val));return;}
    if(action==='start'||action==='next'){go(Math.min(3,state.step+1));return;}
    if(action==='previous'){go(Math.max(0,state.step-1));return;}
    if(action==='teacher'){$('#teacher-dialog').showModal();return;}
    if(action==='close-teacher'){$('#teacher-dialog').close();return;}
    if(action==='reset'){$('#reset-dialog').showModal();return;}
    if(action==='cancel-reset'){$('#reset-dialog').close();return;}
    if(action==='confirm-reset'){
      state.draft='';state.purpose='';state.example=null;state.extra=false;state.visited.clear();practice.reset();$('#extra-prices').checked=false;
      $('#reset-dialog').close();$('#teacher-dialog').close();go(0);announce('Your examples and progress have been cleared.');return;
    }
    if(action==='voice'){state.voice=!state.voice;render();if(state.voice)speak(state.speech);else stop();return;}
    if(action==='stop'){stop();return;}
    if(action==='replay'){if(!state.voice){state.voice=true;render();}speak(state.speech);return;}
    if(action==='fullscreen'){
      if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.().catch(()=>announce('You can use the full-screen option in your browser menu.'));return;
    }
    if(action==='fruit'){
      stop();state.diagram=true;state.representation='full';state.hint=false;state.answer=false;state.question=null;state.questionHint=false;state.questionAnswer=false;
      state.speech=interpolate(C.tasks[1].opening);render();speak(state.speech);return;
    }
    if(action==='transfer-open'){
      if(state.step!==1||!state.extra||state.representation!=='number'||!M.validTransfer(C.transfer.amount))return;
      stop();state.transferOpen=true;state.transferAnswer=false;state.hint=false;state.answer=false;state.question=null;state.questionHint=false;state.questionAnswer=false;
      state.speech=`Now try ${C.transfer.name.toLowerCase()}. In ${M.price(C.transfer.amount)} yuan, how many whole yuan and how many 0.1-yuan parts are there?`;
      render();speak(state.speech);return;
    }
    if(action==='transfer-answer'){
      if(!state.transferOpen)return;
      state.transferAnswer=true;state.speech=M.composition(C.transfer.amount);render();speak(state.speech);return;
    }
    if(action==='transfer-close'){
      stop();state.transferOpen=false;state.transferAnswer=false;state.speech=interpolate(C.tasks[1].opening);render();return;
    }
    if(action==='practice-start'){$('#summary-dialog').close();go(4);return;}
    if(action==='practice-answer'||action==='practice-next'||action==='practice-reset'){
      if(state.step!==4)return;
      const changed=action==='practice-answer'?practice.choose(val):action==='practice-next'?practice.next():practice.reset();
      if(changed!==false){stop();state.speech=practice.guide();render();speak(state.speech);if(action!=='practice-answer'){document.getElementById('practice-question-title')?.focus({preventScroll:true});window.scrollTo({top:0});}}
      return;
    }
    if(action==='representation'){
      if(state.step!==1||!state.diagram||!['full','bars','number'].includes(val))return;
      stop();state.representation=val;state.hint=false;state.answer=false;state.question=null;state.questionHint=false;state.questionAnswer=false;
      state.speech=val==='number'?`${M.price(amount())} yuan. Can you explain this amount without the picture?`:val==='bars'?'Look at the bars and decimal. Explain how they show the same amount.':interpolate(C.tasks[1].opening);
      render();return;
    }
    if(action==='hint'){state.hint=!state.hint;state.speech=interpolate(C.tasks[state.step].hint);render();speak(state.speech);return;}
    if(action==='answer'){
      stop();if(state.step===2&&!state.selectedShop)return;
      state.answer=!state.answer;if(state.step===1)state.diagram=true;
      state.speech=state.answer?(state.step===1?M.composition(amount()):C.tasks[state.step].answer):interpolate(C.tasks[state.step].opening);
      render();if(state.answer)speak(state.speech);return;
    }
    if(action==='shop'){state.selectedShop=val;state.answer=false;state.hint=false;state.speech='How did you compare the prices? Explain your reason before we check together.';render();speak(state.speech);return;}
    if(action==='ribbon'){state.ribbon=!state.ribbon;state.answer=false;state.speech=state.ribbon?'Look at the shaded part. How does it relate to 1 metre?':C.tasks[3].opening;render();speak(state.speech);return;}
    if(action==='level'){stop();state.level=val;state.question=null;state.questionHint=false;state.questionAnswer=false;state.speech=interpolate(C.tasks[state.step].opening);renderGuide();return;}
    if(action==='question'){
      stop();state.question=state.question===Number(val)?null:Number(val);state.questionHint=false;state.questionAnswer=false;
      state.speech=state.question!=null?interpolate(C.tasks[state.step].questions[state.level][state.question].q):interpolate(C.tasks[state.step].opening);
      renderGuide();if(state.question!=null)speak(state.speech);return;
    }
    if(action==='question-hint'||action==='question-answer'){
      if(state.question==null)return;
      const q=C.tasks[state.step].questions[state.level][state.question];
      if(action==='question-hint'){state.questionHint=!state.questionHint;state.speech=interpolate(state.questionHint?q.hint:q.q);}else{state.questionAnswer=!state.questionAnswer;state.speech=interpolate(state.questionAnswer?q.answer:q.q);}
      renderGuide();speak(state.speech);return;
    }
    if(action==='fallback'){say(C.fallback);return;}
    if(action==='summary'){if(state.example){stop();$('#summary-dialog').showModal();}return;}
    if(action==='close-summary'){$('#summary-dialog').close();return;}
  });
  document.addEventListener('input',e=>{
    if(e.target.id==='decimal-example')state.draft=e.target.value;
    if(e.target.id==='decimal-purpose')state.purpose=e.target.value;
  });
  $('#extra-prices').addEventListener('change',e=>{
    stop();state.extra=e.target.checked;state.transferOpen=false;state.transferAnswer=false;
    if(state.step===1){state.speech=interpolate(C.tasks[1].opening);render();}
  });
  document.addEventListener('change',e=>{
    if(e.target.dataset.action==='practice-shuffle'&&state.step===4){practice.setShuffle(e.target.checked);render();}
  });
  document.addEventListener('submit',e=>{
    if(e.target.id!=='reflection-form')return;e.preventDefault();
    if(!state.draft.trim()||!state.purpose.trim()){
      state.error='First write an everyday decimal example, then explain how it helps.';render();$(!state.draft.trim()?'#decimal-example':'#decimal-purpose').focus();return;
    }
    state.example={example:state.draft.trim(),purpose:state.purpose.trim()};state.error='';state.speech='Thank you for sharing! Where else have you seen decimals? What do they measure, and how do they help us?';render();speak(state.speech);announce('The example is displayed for this session. Discuss it together.');$('.example-card')?.scrollIntoView({behavior:'smooth',block:'nearest'});
  });
  window.addEventListener('pagehide',()=>{stop();state.draft='';state.purpose='';state.example=null;practice.reset();});
  window.addEventListener('pageshow',e=>{if(e.persisted){if(state.step===4)state.speech=practice.guide();render();}});
  go(location.hash==='#practice'?4:0);
})();
