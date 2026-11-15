(() => {
  'use strict';
  const C = window.FRUIT_CONTENT;
  const M = window.DecimalMath;
  if (!C || !M) { document.getElementById('app').textContent = '教学内容未能加载，请确认所有网页文件在同一文件夹中。'; return; }
  const $ = (s) => document.querySelector(s);
  const esc = M.escapeHTML;
  const state = {step:0, fruit:'apple', preset:'original', extra:false, diagram:false, representation:'full', hint:false, answer:false, selectedShop:null, ribbon:false, level:'basic', question:null, questionHint:false, questionAnswer:false, speech:'', voice:false, draft:'', purpose:'', example:null, error:'', visited:new Set()};
  const steps = [{title:'欢迎光临',label:'逛逛水果铺'},{title:'任务一',label:'说清价钱'},{title:'任务二',label:'帮我选一家'},{title:'任务三',label:'把小数带回家'}];
  const fruit = () => C.fruits.find(f=>f.id===state.fruit) || C.fruits[0];
  const amount = () => fruit().prices[state.preset];
  const interpolate = (s) => {
    const a=amount(), whole=Math.floor(a/10), tenths=a%10;
    return String(s||'').replaceAll('{price}',M.price(a)).replaceAll('{whole}',String(whole)).replaceAll('{tenths}',String(tenths));
  };
  const art = (id,cls='fruit-art') => `<svg class="${cls}" viewBox="0 0 220 160" role="img" aria-label="${id==='apple'?'苹果':id==='orange'?'橙子':'梨'}插图"><ellipse cx="110" cy="144" rx="66" ry="9" fill="#235d4c" opacity=".07"/>${id==='apple'?'<path d="M111 42c-10-17-33-21-51-10-30 18-26 55-10 82 13 23 31 34 51 25 7-3 13-3 20 0 20 9 38-2 51-25 16-27 20-64-10-82-18-11-41-7-51 10z" fill="#d97555"/><path d="M111 44c-3-17 0-26 8-34" fill="none" stroke="#72523c" stroke-width="8" stroke-linecap="round"/><path d="M119 23c14-21 35-19 43-8-11 14-28 20-43 8z" fill="#63876a"/><path d="M64 56c-12 12-15 25-12 38" stroke="#f3b291" stroke-width="8" fill="none" stroke-linecap="round"/>':id==='orange'?'<circle cx="110" cy="85" r="58" fill="#eda64d"/><path d="M111 30c-1-10 0-17 4-24" stroke="#71563c" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M115 21c15-18 36-15 42-4-12 12-26 14-42 4z" fill="#63876a"/><path d="M72 55c-12 8-17 18-18 31" stroke="#f7cf87" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="137" cy="94" r="2" fill="#d88c34"/><circle cx="149" cy="78" r="2" fill="#d88c34"/><circle cx="127" cy="117" r="2" fill="#d88c34"/>':'<path d="M92 35c-5 27-9 35-24 50-30 33-13 60 40 60 54 0 74-27 43-60-15-16-20-27-23-50-3-23-32-23-36 0z" fill="#c8cd70"/><path d="M108 21c-1-9 3-16 9-21" stroke="#72523c" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M118 17c17-16 34-12 39-2-13 10-25 12-39 2z" fill="#63876a"/><path d="M82 87c-14 15-18 26-9 37" stroke="#e5e7a6" stroke-width="8" fill="none" stroke-linecap="round"/>'}</svg>`;
  const keeper = () => `<svg class="keeper-portrait" viewBox="0 0 140 140" role="img" aria-label="戴绿色围裙的小林店主卡通形象"><circle cx="70" cy="70" r="68" fill="#e9eee1"/><path d="M24 140c1-36 18-49 46-49s45 13 46 49" fill="#d4a985"/><path d="M45 104l10-10h30l10 10 9 36H36z" fill="#356755"/><path d="M52 99v22h36V99" fill="none" stroke="#f9f6eb" stroke-width="5"/><ellipse cx="70" cy="59" rx="33" ry="39" fill="#efc8a2"/><path d="M37 57c-3-34 15-45 34-45 27 0 37 17 33 44-11-1-18-11-22-21-11 15-28 19-45 22z" fill="#4e5141"/><path d="M39 34h65l-6-18H45z" fill="#356755"/><path d="M30 34h80" stroke="#356755" stroke-width="9" stroke-linecap="round"/><path d="M58 62h1m22 0h1" stroke="#4a4537" stroke-width="4" stroke-linecap="round"/><path d="M61 78q9 8 18 0" fill="none" stroke="#a4624d" stroke-width="3" stroke-linecap="round"/><circle cx="49" cy="73" r="5" fill="#e9a795" opacity=".7"/><circle cx="91" cy="73" r="5" fill="#e9a795" opacity=".7"/></svg>`;
  function announce(text){ $('#announcement').textContent=''; requestAnimationFrame(()=>{$('#announcement').textContent=text;}); }
  function localVoice(){return ('speechSynthesis' in window)?speechSynthesis.getVoices().find(v=>v.localService&&/^zh(?:-|_)/i.test(v.lang)):undefined;}
  function stop(){if('speechSynthesis' in window)speechSynthesis.cancel();}
  function speak(text){
    stop(); if(!state.voice)return;
    const v=localVoice();
    if(!v){$('#voice-status').textContent='当前浏览器没有可用的本地中文语音；请使用字幕。';announce('暂无本地中文语音，字幕照常显示。');return;}
    const u=new SpeechSynthesisUtterance(text);u.voice=v;u.lang=v.lang;u.rate=.87;speechSynthesis.speak(u);
  }
  function say(text){state.speech=interpolate(text);renderGuide();speak(state.speech);}
  function clearTask(){state.diagram=false;state.representation='full';state.hint=false;state.answer=false;state.selectedShop=null;state.ribbon=false;state.level='basic';state.question=null;state.questionHint=false;state.questionAnswer=false;state.error='';}
  function go(step){
    stop();state.step=step;clearTask();if(step)state.visited.add(step);
    state.speech=step?interpolate(C.tasks[step].opening):'欢迎光临！今天，我们一起把价签上的小数说清楚，再找找生活里的小数。';
    render();speak(state.speech);document.getElementById('stage-title')?.focus({preventScroll:true});
  }
  function moneyBars(a){
    const {whole,tenths}=M.decompose(a);
    const rows=[];
    for(let i=0;i<whole+(tenths>0?1:0);i++){
      const count=i<whole?10:tenths;
      rows.push(`<div class="bar-row"><span class="bar-label">1元</span><div class="money-bar" role="img" aria-label="一条代表1元，平均分成10份，涂色${count}份">${Array.from({length:10},(_,j)=>`<span class="tenth${j<count?' filled':''}"></span>`).join('')}</div></div>`);
    }
    return `<div class="bar-stack">${rows.join('')}</div><p class="unit-label">每条代表 <strong>1元</strong>，平均分成10份；每一小格代表 <strong>0.1元</strong>。</p>`;
  }
  function intro(){return `<section class="stage-area intro-stage"><div class="stage-card intro-grid"><div class="intro-copy"><p class="eyebrow">20分钟，一起发现小数的用处</p><h2 id="stage-title" class="intro-title" tabindex="-1">小小的数，<br>装着生活里的<br><span>大用途。</span></h2><p class="lead">价签上的2.3元，究竟是多少钱？<br>和小林店主一起，说一说、选一选、找一找。</p><button type="button" class="primary-button" data-action="start">开始逛水果铺 <span aria-hidden="true">→</span></button></div><div class="intro-art" aria-hidden="true"><div class="market-awning"></div><div class="shop-sign">今日新鲜 · 欢迎光临</div><div class="intro-fruits">${art('apple')}${art('orange')}${art('pear')}</div><div class="intro-ticket"><span>苹果一袋</span><strong>2.3 <small>元</small></strong></div><div class="market-shelf"></div></div></div><div class="goal-list"><div class="goal-item"><span class="goal-number">01</span><p>说清一个价钱</p></div><div class="goal-item"><span class="goal-number">02</span><p>说明一个选择</p></div><div class="goal-item"><span class="goal-number">03</span><p>联系自己的生活</p></div></div></section>`;}
  function taskOne(){
    const f=fruit(),a=amount(),mode=state.representation;
    const controls=state.diagram?`<div class="representation-controls"><span class="muted">教师展示</span><div class="segmented" role="group" aria-label="任务一展示阶段">${[['full','完整画面'],['bars','单位条与小数'],['number','只看小数']].map(([id,label])=>`<button type="button" data-action="representation" data-value="${id}" class="${mode===id?'active':''}" aria-pressed="${mode===id}">${label}</button>`).join('')}</div><p class="representation-note">先联系图与数，再逐步隐藏；需要时可恢复完整画面。</p></div>`:'';
    const context=mode==='full'?`<div class="market-controls"><span class="muted">点一点价签，看看数量</span><div class="segmented" aria-label="价签版本">${C.presets.filter(v=>state.extra||v.id==='original').map(v=>`<button type="button" data-action="preset" data-value="${v.id}" class="${state.preset===v.id?'active':''}" aria-pressed="${state.preset===v.id}">${esc(v.label)}</button>`).join('')}</div></div><div class="fruit-grid${state.extra?'':' core-only'}">${C.fruits.filter(v=>state.extra||v.id==='apple').map(v=>`<button type="button" class="fruit-card${v.id===f.id?' selected':''}" data-action="fruit" data-value="${v.id}" aria-pressed="${v.id===f.id}" aria-label="${esc(v.name)}，每${esc(v.unit)}${M.price(v.prices[state.preset])}元，点击查看单位条">${art(v.id)}<span class="fruit-name">${esc(v.name)} <small>一${esc(v.unit)}</small></span><span class="price-ticket"><strong class="price-number">${M.price(v.prices[state.preset])}</strong><span class="price-unit">元</span></span><span class="fruit-caption">点击价签 · 看单位条</span></button>`).join('')}</div>`:'';
    const diagram=mode==='number'?'<p class="number-prompt">不看图，你能说清这个数表示多少钱吗？</p>':state.diagram?moneyBars(a):'<div class="empty-state"><span class="mini-bars" aria-hidden="true"><i></i><i></i><i></i></span><p>先说说你的想法，再点击价签看单位条。</p></div>';
    return `<div class="stage-card">${controls}${context}<div class="representation${mode==='number'?' number-only':''}"><h3>${mode==='full'?`${esc(f.name)}一${esc(f.unit)} `:''}<span class="accent-number">${M.price(a)}元</span></h3>${diagram}</div><div class="task-actions"><button type="button" class="secondary-button" data-action="hint">思考提示</button><button type="button" class="quiet-button" data-action="answer">核对价格组成</button></div>${state.hint?`<div class="hint-box" role="status">${esc(interpolate(C.tasks[1].hint))}</div>`:''}${state.answer?`<div class="answer-box" role="status"><strong>${M.price(a)}元 = ${Math.floor(a/10)}元${a%10}角</strong><p>${Math.floor(a/10)}个1元${a%10?'，加上'+(a%10)+'个0.1元':'，不足1元的部分是0元'}。</p></div>`:''}</div>`;
  }
  function taskTwo(){return `<div class="stage-card"><p class="shop-condition"><span class="badge">公平比一比</span> 同品种、同品质、同样一袋苹果，只比较价钱。</p><div class="comparison-grid">${[{id:'A',name:'小林水果铺',price:23},{id:'B',name:'街角水果铺',price:28}].map(v=>`<button type="button" class="shop-card${state.selectedShop===v.id?' selected':''}" data-action="shop" data-value="${v.id}" aria-pressed="${state.selectedShop===v.id}"><span class="shop-label">${v.id}店 · ${v.name}</span>${art('apple')}<span class="shop-price">${M.price(v.price)}<small>元</small></span><span class="shop-pack">同样一袋苹果</span><span class="shop-select-label">${state.selectedShop===v.id?'已选择 · 请说明理由':'我想选这家'}</span></button>`).join('')}</div>${state.selectedShop?`<div class="choice-prompt" role="status">你选择了${state.selectedShop}店。请先说一说：你是怎样比较的？</div>`:'<p class="choice-prompt">先选一家，再用价钱说明你的理由。</p>'}<div class="task-actions"><button type="button" class="secondary-button" data-action="hint">思考提示</button><button type="button" class="quiet-button" data-action="answer" ${!state.selectedShop?'disabled':''}>核对选择与价差</button></div>${state.hint?`<div class="hint-box" role="status">${esc(C.tasks[2].hint)}</div>`:''}${state.answer?'<div class="answer-box" role="status"><p class="equation">2.3元 <span>＜</span> 2.8元</p><strong>选择A店，可以少花5角钱。</strong><p>整元部分相同，比较3角与8角；8角比3角多5角。</p></div>':''}</div>`;}
  function taskThree(){return `<div class="stage-card"><div class="ribbon-wrap"><div class="board-tools"><h3>用丝带，看看0.7米有多长。</h3><span class="badge">完整一条是1米</span></div><div class="ribbon" role="img" aria-label="1米丝带平均分成10份${state.ribbon?'，其中7份涂色表示0.7米':'，尚未标出0.7米'}">${Array.from({length:10},(_,i)=>`<span class="ribbon-part${state.ribbon&&i<7?' filled':''}"></span>`).join('')}</div><div class="ruler-labels"><span>0</span><span>1米</span></div><p class="ribbon-caption">把1米平均分成10份，每份是0.1米。你会指出哪一段？</p><div class="task-actions"><button type="button" class="secondary-button" data-action="ribbon">${state.ribbon?'重新观察':'标出0.7米'}</button><button type="button" class="quiet-button" data-action="hint">思考提示</button><button type="button" class="quiet-button" data-action="answer">核对长度含义</button></div>${state.hint?`<div class="hint-box" role="status">${esc(C.tasks[3].hint)}</div>`:''}${state.answer?'<div class="answer-box" role="status">0.7米是7个0.1米，也就是十分之七米。这里的单位是“米”。</div>':''}</div><form class="reflection-form" id="reflection-form" novalidate><div class="reflection-heading"><span class="badge">每个人都想一想</span><h3>把小数带回自己的生活</h3></div><p>先在学习单上写自己的例子，再一起分享。这里记录一个匿名例子。</p><label for="decimal-example">我在哪里见过小数？它表示什么？</label><textarea id="decimal-example" maxlength="160" rows="2" placeholder="例如：我见过……，其中……表示……。" required>${esc(state.draft)}</textarea><label for="decimal-purpose">知道这个数，能帮我做什么？</label><textarea id="decimal-purpose" maxlength="160" rows="2" placeholder="它能帮助我……。" required>${esc(state.purpose)}</textarea><div class="form-actions"><span class="field-note">不用填写姓名；例子由老师和同学一起讨论。</span><button type="submit" class="primary-button">记录并分享</button></div>${state.error?`<p class="field-error" role="alert">${esc(state.error)}</p>`:''}</form>${state.example?`<div class="example-card" role="status"><span class="eyebrow">今天的生活例子</span><p>${esc(state.example.example)}</p><p><strong>它的用途：</strong>${esc(state.example.purpose)}</p><small>一起想想：小数表示的数量和单位是否说清楚了？</small></div>`:''}</div>`;}
  function renderGuide(){
    let aside=$('.guide-panel');if(!aside)return;
    const prior=aside.contains(document.activeElement)?{action:document.activeElement.dataset.action,value:document.activeElement.dataset.value}:null;
    const task=C.tasks[state.step];
    const qs=task?.questions[state.level]||[];
    const q=state.question==null?null:qs[state.question];
    aside.innerHTML=`<section class="shopkeeper-card"><div class="keeper-head">${keeper()}<div><p class="eyebrow">水果铺的小帮手</p><h3 class="keeper-name">小林店主</h3><span class="muted">一起听，一起想</span></div></div><div class="speech-bubble" aria-live="polite">${esc(state.speech)}</div><div class="speech-actions"><button type="button" class="quiet-button" data-action="replay">再听一遍</button><button type="button" class="quiet-button" data-action="stop">停止</button></div></section>${task?`<section class="question-bank"><div class="question-heading"><h3>再问一步</h3><span class="muted">先想，再展开</span></div><div class="level-tabs" role="group" aria-label="问题层次">${[['basic','基础'],['apply','应用'],['extend','拓展']].map(([id,name])=>`<button type="button" data-action="level" data-value="${id}" class="${state.level===id?'active':''}" aria-pressed="${state.level===id}">${name}</button>`).join('')}</div><div class="question-list">${qs.map((v,i)=>`<button type="button" class="question-card${state.question===i?' active':''}" data-action="question" data-value="${i}" aria-expanded="${state.question===i}">${esc(interpolate(v.q))}<span aria-hidden="true">${state.question===i?'−':'+'}</span></button>`).join('')}</div>${q?`<div class="question-reveal"><div class="task-actions"><button type="button" class="quiet-button" data-action="question-hint">给一点提示</button><button type="button" class="quiet-button" data-action="question-answer">展开回应</button></div>${state.questionHint?`<p class="hint-box">${esc(interpolate(q.hint))}</p>`:''}${state.questionAnswer?`<p class="question-answer" role="status">${esc(interpolate(q.answer))}</p>`:''}</div>`:''}<button type="button" class="fallback-button" data-action="fallback">还有别的问题？</button></section>`:'<section class="question-bank"><p class="eyebrow">今天的约定</p><h3>先说说你的想法。</h3><p>看看图，想一想，再把理由说给大家听。</p><p class="muted">每一个选择，都值得听听为什么。</p></section>'}`;
    if(prior?.action)Array.from(aside.querySelectorAll('[data-action]')).find(el=>el.dataset.action===prior.action&&el.dataset.value===prior.value)?.focus({preventScroll:true});
  }
  function render(){
    const prior={action:document.activeElement?.dataset.action,value:document.activeElement?.dataset.value};
    $('#lesson-nav').innerHTML=steps.map((s,i)=>`<button type="button" class="step-tab${state.step===i?' active':''}" data-action="step" data-value="${i}" ${state.step===i?'aria-current="step"':''}><span class="step-number">${i===0?'起点':String(i).padStart(2,'0')}</span><span class="step-label">${s.label}</span></button>`).join('');
    const header=state.step?`<div class="stage-header"><p class="eyebrow">${steps[state.step].title} / 认识小数</p><h2 id="stage-title" tabindex="-1">${esc(C.tasks[state.step].title)}</h2><p class="lead">${esc(C.tasks[state.step].subtitle)}</p></div>`:'';
    $('#app').innerHTML=(state.step?`<section class="stage-area">${header}${[null,taskOne,taskTwo,taskThree][state.step]()}</section>`:intro())+'<aside class="guide-panel" aria-label="店主与分层问题"></aside>';
    renderGuide();
    $('#lesson-footer').innerHTML=`<div class="lesson-status"><span class="status-dot"></span>${state.step?`任务 ${state.step} / 3 · ${steps[state.step].label}`:'先解释，再选择，最后联系生活。'}</div><div class="footer-actions">${state.step?'<button type="button" class="quiet-button" data-action="previous">← 上一步</button>':''}<button type="button" class="primary-button" data-action="${state.step===3?'summary':'next'}" ${state.step===3&&!state.example?'disabled title="先记录一个生活例子和它的用途"':''}>${state.step===0?'开始学习':state.step===3?'回顾今天的发现':'下一个任务 →'}</button></div>`;
    $('#voice-toggle').textContent=state.voice?'朗读开启':'朗读关闭';$('#voice-toggle').setAttribute('aria-pressed',String(state.voice));
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
      state.draft='';state.purpose='';state.example=null;state.fruit='apple';state.preset='original';state.extra=false;state.visited.clear();$('#extra-prices').checked=false;
      $('#reset-dialog').close();$('#teacher-dialog').close();go(0);announce('本次输入与进度已清除。');return;
    }
    if(action==='voice'){state.voice=!state.voice;render();if(state.voice)speak(state.speech);else stop();return;}
    if(action==='stop'){stop();return;}
    if(action==='replay'){if(!state.voice){state.voice=true;render();}speak(state.speech);return;}
    if(action==='fullscreen'){
      if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.().catch(()=>announce('可以使用浏览器的全屏菜单进行投影。'));return;
    }
    if(action==='fruit'){
      if(!state.extra&&val!=='apple')return;
      stop();state.fruit=val;state.diagram=true;state.representation='full';state.hint=false;state.answer=false;state.question=null;state.questionHint=false;state.questionAnswer=false;
      state.speech=interpolate(C.tasks[1].opening);render();speak(state.speech);return;
    }
    if(action==='preset'){
      stop();if(val!=='original'&&!state.extra)return;
      state.preset=val;state.diagram=false;state.representation='full';state.answer=false;state.hint=false;state.question=null;state.questionHint=false;state.questionAnswer=false;state.speech=interpolate(C.tasks[1].opening);render();return;
    }
    if(action==='representation'){
      if(state.step!==1||!state.diagram||!['full','bars','number'].includes(val))return;
      stop();state.representation=val;state.hint=false;state.answer=false;state.question=null;state.questionHint=false;state.questionAnswer=false;
      state.speech=val==='number'?`${M.price(amount())}元。不看图，你能说清这个数表示多少钱吗？`:val==='bars'?'看着单位条与小数，说一说它们怎样表示同一个数量。':interpolate(C.tasks[1].opening);
      render();return;
    }
    if(action==='hint'){state.hint=!state.hint;state.speech=interpolate(C.tasks[state.step].hint);render();speak(state.speech);return;}
    if(action==='answer'){
      stop();if(state.step===2&&!state.selectedShop)return;
      state.answer=!state.answer;if(state.step===1)state.diagram=true;
      state.speech=state.answer?(state.step===1?`${M.price(amount())}元，是${Math.floor(amount()/10)}元${amount()%10}角。`:C.tasks[state.step].answer):interpolate(C.tasks[state.step].opening);
      render();if(state.answer)speak(state.speech);return;
    }
    if(action==='shop'){state.selectedShop=val;state.answer=false;state.hint=false;state.speech='你是怎样比较的？先把理由说清楚，我们再一起核对。';render();speak(state.speech);return;}
    if(action==='ribbon'){state.ribbon=!state.ribbon;state.answer=false;state.speech=state.ribbon?'看一看涂色部分。你能说清它与1米的关系吗？':C.tasks[3].opening;render();speak(state.speech);return;}
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
  $('#extra-prices').addEventListener('change',e=>{stop();state.extra=e.target.checked;state.preset='original';state.fruit='apple';state.diagram=false;state.representation='full';state.answer=false;state.question=null;if(state.step===1){state.speech=interpolate(C.tasks[1].opening);render();}});
  document.addEventListener('submit',e=>{
    if(e.target.id!=='reflection-form')return;e.preventDefault();
    if(!state.draft.trim()||!state.purpose.trim()){
      state.error='请先写一个生活中的小数例子，再说说它的用途。';render();$(!state.draft.trim()?'#decimal-example':'#decimal-purpose').focus();return;
    }
    state.example={example:state.draft.trim(),purpose:state.purpose.trim()};state.error='';state.speech='谢谢你的分享！除了购物，你还在哪里见过小数？它表示什么数量，能帮我们做什么？';render();speak(state.speech);announce('例子已临时展示，请一起讨论。');$('.example-card')?.scrollIntoView({behavior:'smooth',block:'nearest'});
  });
  window.addEventListener('pagehide',()=>{stop();state.draft='';state.purpose='';state.example=null;});
  window.addEventListener('pageshow',e=>{if(e.persisted)render();});
  go(0);
})();
