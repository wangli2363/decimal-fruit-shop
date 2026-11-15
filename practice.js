/* Fixed, in-memory practice. Question content lives in content.js. */
(function (root) {
  'use strict';

  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));

  function create(content) {
    if (!content || !Array.isArray(content.questions) || content.questions.length !== 10) {
      throw new TypeError('课后练习需要固定的十道题。');
    }
    const questions = content.questions;
    const groups = content.groups || [];
    questions.forEach((question) => {
      const ids = question.options.map((option) => option.id);
      if (new Set(ids).size !== ids.length || !ids.includes(question.correctId)) {
        throw new TypeError('题目选项需要唯一编号及有效答案。');
      }
    });
    let index = 0;
    let finished = false;
    let shuffle = Boolean(content.shuffleDefault);
    let shuffledOrders = null;
    let records = newRecords();

    function newRecords() {
      return questions.map(() => ({ attempts: 0, chosenIds: [], resolved: false, correct: false, feedback: '' }));
    }
    function started() { return records.some((record) => record.attempts > 0); }
    function correctCount() { return records.filter((record) => record.correct).length; }
    function shuffledOptions() {
      if (!shuffledOrders) {
        shuffledOrders = questions.map((question) => {
          const options = question.options.slice();
          for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
          }
          return options;
        });
      }
      return shuffledOrders;
    }
    function optionsFor(questionIndex) {
      return shuffle ? shuffledOptions()[questionIndex] : questions[questionIndex].options;
    }
    function correctOption(question) { return question.options.find((option) => option.id === question.correctId); }
    function choose(optionId) {
      if (finished) return false;
      const question = questions[index];
      const record = records[index];
      if (record.resolved || record.attempts >= 2 || record.chosenIds.includes(optionId) ||
          !question.options.some((option) => option.id === optionId)) return false;
      record.chosenIds.push(optionId);
      record.attempts++;
      if (optionId === question.correctId) {
        record.correct = true;
        record.resolved = true;
        record.feedback = 'correct';
      } else if (record.attempts === 1) {
        record.feedback = 'hint';
      } else {
        record.resolved = true;
        record.feedback = 'reveal';
      }
      return true;
    }
    function next() {
      if (finished || !records[index].resolved) return false;
      if (index === questions.length - 1) finished = true;
      else index++;
      return true;
    }
    function reset() {
      index = 0;
      finished = false;
      records = newRecords();
      shuffledOrders = null;
      return true;
    }
    function setShuffle(value) {
      const enabled = Boolean(value);
      if (started() || shuffle === enabled) return false;
      shuffle = enabled;
      if (shuffle) shuffledOptions();
      return true;
    }
    function progress() {
      const lit = correctCount();
      return `<section class="practice-progress" aria-label="单位条进度"><div class="practice-meter-label"><strong>把十小格，连成一整条。</strong><span>整条代表1元</span></div><div class="practice-meter" role="progressbar" aria-label="答对一题点亮一格" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${lit}">${Array.from({length:10}, (_, i) => `<span class="practice-cell${i < lit ? ' is-lit' : ''}" aria-hidden="true"></span>`).join('')}</div><p class="practice-note">每格代表0.1元，也就是1角。答对一题，点亮一格。</p></section>`;
    }
    function diagram(question) {
      if (!question.diagram) return '';
      const amount = question.diagram.amount;
      if (question.diagram.type !== 'money' || !Number.isInteger(amount) || amount < 1 || amount > 9) {
        throw new TypeError('练习图示必须是一条十等分的单位条。');
      }
      return `<figure class="practice-diagram"><figcaption>整条代表1元，平均分成10份；每格是0.1元。</figcaption><div class="money-bar" role="list" aria-label="1元单位条，请观察哪些格子涂色">${Array.from({length:10}, (_, i) => `<span class="tenth${i < amount ? ' filled' : ''}" role="listitem" aria-label="第${i+1}格，${i < amount ? '已涂色' : '未涂色'}"></span>`).join('')}</div></figure>`;
    }
    function feedback(question, record) {
      if (!record.feedback) return '';
      if (record.feedback === 'hint') {
        return `<div class="practice-feedback is-hint" role="status"><strong>再想一想，还可以选一次。</strong><p>${escapeHTML(question.hint)}</p></div>`;
      }
      if (record.correct) {
        return `<div class="practice-feedback is-correct" role="status"><strong>对！这一格点亮了。</strong><p>${escapeHTML(question.explanation)}</p></div>`;
      }
      return `<div class="practice-feedback is-reveal" role="status"><strong>一起核对：${escapeHTML(correctOption(question).text)}</strong><p>${escapeHTML(question.explanation)}</p><p class="practice-note">这道题的格子暂时没有点亮。看懂解释，再继续练习。</p></div>`;
    }
    function guide() {
      if (finished) return correctCount() === questions.length ? '你集满了1元！十个0.1元合起来是1元。再回顾一下，小数怎样帮助我们解释数量、比较价钱和联系生活。' : '还有一些格子等你点亮。先回顾解释，再从第一题试一试。';
      const question = questions[index];
      const record = records[index];
      if (record.feedback === 'hint') return `再想一想，还可以选一次。${question.hint}`;
      if (record.feedback === 'correct') return `对！${question.explanation}`;
      if (record.feedback === 'reveal') return `一起核对：${correctOption(question).text}。${question.explanation}`;
      return '先读题、想清楚，再选择。需要时可以回到课堂看看图示。';
    }
    function render() {
      const note = '<p class="practice-note practice-privacy">刷新会重新开始。不输入姓名，不记录成绩。</p>';
      if (finished) {
        const complete = correctCount() === questions.length;
        return `<section id="practice-stage" class="stage-card practice-card practice-summary"><header class="practice-header"><p class="eyebrow">课后练习 · 一起回顾</p><h2 id="practice-question-title" tabindex="-1" class="practice-summary-title">${complete ? '你集满了1元' : '还有一些格子等你点亮'}</h2><p class="practice-summary-note">${complete ? '十个0.1元，也就是十个1角，合起来正好是1元。' : '没有点亮的格子，表示对应题目还可以再练一练。先回顾解释，再试一次。'}</p></header>${progress()}<div class="practice-reviews">${groups.map((group) => `<article class="practice-review"><h3>${escapeHTML(group.title)}</h3><p>${escapeHTML(group.review)}</p></article>`).join('')}</div>${note}<div class="practice-actions"><button type="button" class="primary-button" data-action="practice-reset">再练一次</button><button type="button" class="secondary-button" data-action="step" data-value="1">回到课堂看看</button></div></section>`;
      }
      const question = questions[index];
      const record = records[index];
      const group = groups.find((item) => item.id === question.group);
      const options = optionsFor(index);
      return `<section id="practice-stage" class="stage-card practice-card"><header class="practice-header"><p class="eyebrow">课后练习 · 8–10分钟</p><h2 class="practice-title">再练一练，把小数说清楚。</h2>${note}</header>${progress()}<div class="practice-settings"><label class="practice-shuffle-label"><input type="checkbox" data-action="practice-shuffle"${shuffle ? ' checked' : ''}${started() ? ' disabled' : ''}>打乱选项顺序</label><span class="practice-note">${started() ? '本轮顺序已固定；重新练习时可以调整。' : '默认保持固定顺序，便于一起讲解。'}</span></div><section class="practice-question" aria-labelledby="practice-question-title"><p class="practice-group">${escapeHTML(question.group)}组 · ${escapeHTML(group ? group.title : '')} <span>第${index+1}题 / 共10题</span></p><h3 id="practice-question-title" tabindex="-1" class="practice-question-title">${escapeHTML(question.prompt)}</h3>${diagram(question)}<div class="practice-options" role="group" aria-label="请选择一个答案">${options.map((option) => {
        const selected = record.chosenIds.includes(option.id);
        const correct = record.resolved && option.id === question.correctId;
        const disabled = record.resolved || selected;
        return `<button type="button" class="practice-option${selected ? ' is-selected' : ''}${selected && !correct ? ' is-attempted' : ''}${correct ? ' is-correct' : ''}" data-action="practice-answer" data-value="${escapeHTML(option.id)}"${disabled ? ' disabled' : ''}>${escapeHTML(option.text)}</button>`;
      }).join('')}</div>${feedback(question, record)}</section><div class="practice-actions"><button type="button" class="primary-button" data-action="practice-next"${record.resolved ? '' : ' disabled'}>${index === questions.length-1 ? '看看我的单位条' : '下一题 →'}</button></div></section>`;
    }
    return Object.freeze({
      get state() {
        return Object.freeze({ index, finished, shuffle, correctCount: correctCount(), total: questions.length,
          records: Object.freeze(records.map((record) => Object.freeze({ ...record, chosenIds: Object.freeze(record.chosenIds.slice()) }))) });
      },
      choose, next, reset, setShuffle, render, guide
    });
  }
  root.FruitPractice = Object.freeze({ create });
})(typeof window !== 'undefined' ? window : globalThis);
