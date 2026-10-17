'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const bank = require('../public/question-bank.js');

test('exports exactly three games with 25 fully localized questions each', () => {
  assert.deepEqual(Object.keys(bank).sort(), ['games', 'languages']);
  assert.deepEqual(bank.languages, ['ar', 'he', 'en']);
  assert.deepEqual(bank.games.map(({ id, mode }) => [id, mode]), [
    ['science', 'quiz'], ['math', 'teams'], ['together', 'cooperative']
  ]);
  const prompts = Object.fromEntries(bank.languages.map(language => [language, new Set()]));
  for (const game of bank.games) {
    assert.deepEqual(Object.keys(game).sort(), ['description', 'id', 'mode', 'questions', 'title']);
    assert.equal(game.questions.length, 25, game.id);
    for (const field of ['title', 'description']) {
      assert.deepEqual(Object.keys(game[field]).sort(), ['ar', 'en', 'he']);
      for (const language of bank.languages) {
        assert.equal(typeof game[field][language], 'string');
        assert.ok(game[field][language].trim());
      }
    }
    const answers = new Set();
    for (const question of game.questions) {
      assert.deepEqual(Object.keys(question).sort(), ['answer', 'options', 'q']);
      assert.deepEqual(Object.keys(question.q).sort(), ['ar', 'en', 'he']);
      assert.deepEqual(Object.keys(question.options).sort(), ['ar', 'en', 'he']);
      assert.ok(Number.isInteger(question.answer));
      assert.ok(question.answer >= 0 && question.answer < 4);
      answers.add(question.answer);
      for (const language of bank.languages) {
        const prompt = question.q[language];
        assert.equal(typeof prompt, 'string');
        assert.ok(prompt.trim());
        assert.ok(!prompts[language].has(prompt.trim()), `Duplicate ${language} prompt: ${prompt}`);
        prompts[language].add(prompt.trim());
        const options = question.options[language];
        assert.ok(Array.isArray(options));
        assert.equal(options.length, 4);
        for (const option of options) {
          assert.equal(typeof option, 'string');
          assert.ok(option.trim());
        }
        assert.equal(new Set(options.map(option => option.trim())).size, 4);
        if (language !== 'en') {
          const script = language === 'ar' ? /\p{Script=Arabic}/u : /\p{Script=Hebrew}/u;
          assert.match(prompt, script);
          for (const option of options) {
            // Pure numbers, fractions, angles, and percentages need no translation.
            if (/\p{L}/u.test(option)) assert.match(option, script);
          }
        }
      }
    }
    assert.deepEqual([...answers].sort(), [0, 1, 2, 3]);
  }
});

test('loads standalone in a browser without CommonJS or dependencies', () => {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../public/question-bank.js'), 'utf8'), context);
  assert.deepEqual(JSON.parse(JSON.stringify(context.window.CLASSVERSE_BANK)), bank);
});

function checkAnswer(gameId, prompt, expected) {
  const question = bank.games.find(game => game.id === gameId).questions.find(item => item.q.en === prompt);
  assert.ok(question, `Missing representative question: ${prompt}`);
  for (const language of bank.languages) {
    assert.equal(question.options[language][question.answer], expected[language], `${gameId}: ${language}`);
  }
}

test('representative science answers are correct in every language', () => {
  checkAnswer('science', 'Which gas do plants absorb during photosynthesis?',
    { ar: 'ثاني أكسيد الكربون', he: 'פחמן דו-חמצני', en: 'Carbon dioxide' });
  checkAnswer('science', 'What causes day and night?',
    { ar: 'دوران الأرض حول محورها', he: 'סיבוב כדור הארץ סביב צירו', en: 'Earth rotating on its axis' });
  checkAnswer('science', 'At sea level, at approximately what temperature does pure water boil in degrees Celsius?',
    { ar: '100', he: '100', en: '100' });
  checkAnswer('science', 'Where does most nutrient absorption occur in the digestive system?',
    { ar: 'الأمعاء الدقيقة', he: 'במעי הדק', en: 'Small intestine' });
});

test('representative arithmetic, geometry, and probability answers are correct', () => {
  for (const [prompt, answer] of [
    ['What is 48 × 6?', String(48 * 6)],
    ['What is 3/4 + 1/8?', '7/8'],
    ['What is 25% of 80?', String(0.25 * 80)],
    ['What is 6.5 + 2.75?', String(6.5 + 2.75)],
    ['What is 5 + 3 × 4?', String(5 + 3 * 4)],
    ['What is 7.2 − 3.85?', (7.2 - 3.85).toFixed(2)],
    ['What is the probability of rolling an even number on a fair six-sided die numbered 1 to 6?', '1/2']
  ]) {
    checkAnswer('math', prompt, { ar: answer, he: answer, en: answer });
  }
  checkAnswer('math', 'What is the area of a triangle with base 10 cm and perpendicular height 6 cm?',
    { ar: '30 سم²', he: '30 סמ״ר', en: '30 cm²' });
  checkAnswer('math', 'What is the volume of a cube with edge length 3 cm?',
    { ar: '27 سم³', he: '27 סמ״ק', en: '27 cm³' });
});

test('cooperative questions have objective factual and reasoning answers', () => {
  checkAnswer('together', 'What is the largest ocean on Earth?',
    { ar: 'المحيط الهادئ', he: 'האוקיינוס השקט', en: 'Pacific Ocean' });
  checkAnswer('together', 'How many days are in a leap year in the Gregorian calendar?',
    { ar: '366', he: '366', en: '366' });
  checkAnswer('together', 'A team has 20 cards and needs 5 cards per poster. How many complete posters can it make?',
    { ar: '4', he: '4', en: '4' });
  checkAnswer('together', 'A team claims all metals are attracted to magnets. Which observation disproves this claim?',
    { ar: 'عدم انجذاب سلك نحاسي نقي', he: 'חוט נחושת טהורה אינו נמשך למגנט', en: 'A pure copper wire is not attracted' });
  checkAnswer('together', 'One team measured a desk in centimeters and another in meters. What is needed to compare the numerical measurements?',
    { ar: 'تحويل القياسين إلى الوحدة نفسها', he: 'להמיר את שתי המדידות לאותה יחידה', en: 'Convert both measurements to the same unit' });
});
