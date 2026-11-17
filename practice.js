/* Fixed, in-memory practice. Question content lives in content.js. */
(function (root) {
  'use strict';

  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));

  function create(content) {
    if (!content || !Array.isArray(content.questions) || content.questions.length !== 10) {
      throw new TypeError('Practice needs exactly ten fixed questions.');
    }
    const questions = content.questions;
    const groups = content.groups || [];
    questions.forEach((question) => {
      const ids = question.options.map((option) => option.id);
      if (new Set(ids).size !== ids.length || !ids.includes(question.correctId)) {
        throw new TypeError('Each option needs a unique ID and a valid correct answer.');
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
      return `<section class="practice-progress" aria-label="Unit-bar progress"><div class="practice-meter-label"><strong>Fill ten cells to make one whole bar.</strong><span>The whole bar represents 1 yuan</span></div><div class="practice-meter" role="progressbar" aria-label="Each correct answer lights one cell" aria-valuemin="0" aria-valuemax="10" aria-valuenow="${lit}">${Array.from({length:10}, (_, i) => `<span class="practice-cell${i < lit ? ' is-lit' : ''}" aria-hidden="true"></span>`).join('')}</div><p class="practice-note">Each cell is 0.1 yuan, or 1 jiao. Each correct answer lights one cell.</p></section>`;
    }
    function diagram(question) {
      if (!question.diagram) return '';
      const amount = question.diagram.amount;
      if (question.diagram.type !== 'money' || !Number.isInteger(amount) || amount < 1 || amount > 9) {
        throw new TypeError('A practice diagram must be one bar divided into ten equal parts.');
      }
      return `<figure class="practice-diagram"><figcaption>The whole bar represents 1 yuan. It has 10 equal cells. Each cell is 0.1 yuan.</figcaption><div class="money-bar" role="list" aria-label="A 1-yuan bar. Look at the shaded cells.">${Array.from({length:10}, (_, i) => `<span class="tenth${i < amount ? ' filled' : ''}" role="listitem" aria-label="Cell ${i+1}, ${i < amount ? 'shaded' : 'not shaded'}"></span>`).join('')}</div></figure>`;
    }
    function feedback(question, record) {
      if (!record.feedback) return '';
      if (record.feedback === 'hint') {
        return `<div class="practice-feedback is-hint" role="status"><strong>Think again. You can try once more.</strong><p>${escapeHTML(question.hint)}</p></div>`;
      }
      if (record.correct) {
        return `<div class="practice-feedback is-correct" role="status"><strong>Correct! One more cell is lit.</strong><p>${escapeHTML(question.explanation)}</p></div>`;
      }
      return `<div class="practice-feedback is-reveal" role="status"><strong>Let us check: ${escapeHTML(correctOption(question).text)}</strong><p>${escapeHTML(question.explanation)}</p><p class="practice-note">This cell is not lit yet. Read the explanation, then continue.</p></div>`;
    }
    function guide() {
      if (finished) return correctCount() === questions.length ? 'You completed a 1-yuan bar! Ten 0.1-yuan parts make 1 yuan. Let us review how decimals help us describe quantities, compare prices and explain everyday examples.' : 'Some cells are still waiting to be lit. Read the explanations, then try again from the first question.';
      const question = questions[index];
      const record = records[index];
      if (record.feedback === 'hint') return `Think again. You can try once more. ${question.hint}`;
      if (record.feedback === 'correct') return `Correct! ${question.explanation}`;
      if (record.feedback === 'reveal') return `Let us check: ${correctOption(question).text}. ${question.explanation}`;
      return 'Read, think, then choose. You can return to the lesson to look at the diagrams.';
    }
    function render() {
      const note = '<p class="practice-note practice-privacy">Refreshing starts again. No names or results are saved.</p>';
      if (finished) {
        const complete = correctCount() === questions.length;
        return `<section id="practice-stage" class="stage-card practice-card practice-summary"><header class="practice-header"><p class="eyebrow">Practice · Let us review</p><h2 id="practice-question-title" tabindex="-1" class="practice-summary-title">${complete ? 'You completed a 1-yuan bar!' : 'Some cells are waiting to be lit'}</h2><p class="practice-summary-note">${complete ? 'Ten 0.1-yuan parts, or ten 1-jiao parts, make exactly 1 yuan.' : 'An unlit cell shows a question to practise again. Read the explanation, then have another try.'}</p></header>${progress()}<div class="practice-reviews">${groups.map((group) => `<article class="practice-review"><h3>${escapeHTML(group.title)}</h3><p>${escapeHTML(group.review)}</p></article>`).join('')}</div>${note}<div class="practice-actions"><button type="button" class="primary-button" data-action="practice-reset">Try again</button><button type="button" class="secondary-button" data-action="step" data-value="1">Back to the lesson</button></div></section>`;
      }
      const question = questions[index];
      const record = records[index];
      const group = groups.find((item) => item.id === question.group);
      const options = optionsFor(index);
      return `<section id="practice-stage" class="stage-card practice-card"><header class="practice-header"><p class="eyebrow">After-class practice · 8–10 minutes</p><h2 class="practice-title">Let us practise decimals.</h2>${note}</header>${progress()}<div class="practice-settings"><label class="practice-shuffle-label"><input type="checkbox" data-action="practice-shuffle"${shuffle ? ' checked' : ''}${started() ? ' disabled' : ''}>Shuffle the choices</label><span class="practice-note">${started() ? 'The order is fixed for this round. You can change it when you start again.' : 'Choices stay in order unless you shuffle them.'}</span></div><section class="practice-question" aria-labelledby="practice-question-title"><p class="practice-group">${escapeHTML(group ? group.title : 'Practice')} <span>Question ${index+1} of 10</span></p><h3 id="practice-question-title" tabindex="-1" class="practice-question-title">${escapeHTML(question.prompt)}</h3>${diagram(question)}<div class="practice-options" role="group" aria-label="Choose one answer">${options.map((option) => {
        const selected = record.chosenIds.includes(option.id);
        const correct = record.resolved && option.id === question.correctId;
        const disabled = record.resolved || selected;
        return `<button type="button" class="practice-option${selected ? ' is-selected' : ''}${selected && !correct ? ' is-attempted' : ''}${correct ? ' is-correct' : ''}" data-action="practice-answer" data-value="${escapeHTML(option.id)}"${disabled ? ' disabled' : ''}>${escapeHTML(option.text)}</button>`;
      }).join('')}</div>${feedback(question, record)}</section><div class="practice-actions"><button type="button" class="primary-button" data-action="practice-next"${record.resolved ? '' : ' disabled'}>${index === questions.length-1 ? 'See my unit bar' : 'Next question →'}</button></div></section>`;
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
