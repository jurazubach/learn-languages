#!/usr/bin/env node
// Проверяет все content/<lang>/lessons/<id>/lesson.json.
// Запускается перед сборкой (npm run build) и скиллом /lesson после генерации.
// Ошибки валят сборку, предупреждения только печатаются.

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../content/', import.meta.url));
const LANGS = ['en', 'sk'];
const TYPES = ['translate', 'chunk', 'transform', 'spot', 'form', 'choice'];
const CZECH = /[řůěŘŮĚ]/;
const BLANK = /_{3,}/;

let errors = 0;
let warnings = 0;

const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const isStrArr = (v) => Array.isArray(v) && v.every(isStr);
const words = (s) => s.trim().split(/\s+/).length;

function checkLesson(lang, dir) {
  const file = join(ROOT, lang, 'lessons', dir, 'lesson.json');
  const where = `${lang}/${dir}`;
  const err = (msg) => {
    errors++;
    console.error(`  ✗ ${where}: ${msg}`);
  };
  const warn = (msg) => {
    warnings++;
    console.warn(`  ! ${where}: ${msg}`);
  };

  if (!existsSync(file)) return err('нет lesson.json');

  const raw = readFileSync(file, 'utf8');
  let lesson;
  try {
    lesson = JSON.parse(raw);
  } catch (e) {
    return err(`невалидный JSON: ${e.message}`);
  }

  if (lesson.id !== dir) err(`id "${lesson.id}" не совпадает с папкой "${dir}"`);
  if (lesson.lang !== lang) err(`lang "${lesson.lang}" не совпадает с папкой "${lang}"`);
  if (!Number.isInteger(lesson.number)) err('number должен быть целым числом');
  if (!isStr(lesson.title)) err('нет title');
  if (lesson.date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(lesson.date)) err('date в формате YYYY-MM-DD');
  if (lang === 'sk' && CZECH.test(raw)) err('чешские буквы ř/ů/ě в словацком уроке');

  const rules = Array.isArray(lesson.rules) ? lesson.rules : (err('rules должен быть массивом'), []);
  const ruleIds = new Set();
  for (const r of rules) {
    if (!isStr(r.id)) err('правило без id');
    else if (ruleIds.has(r.id)) err(`повторяется id правила "${r.id}"`);
    ruleIds.add(r.id);
    if (!isStr(r.title)) err(`правило ${r.id}: нет title`);
    if (!isStrArr(r.summary) || r.summary.length === 0) err(`правило ${r.id}: summary — непустой массив строк`);
    else if (r.summary.length > 6) warn(`правило ${r.id}: шпаргалка длиннее 6 строк`);
    for (const ex of r.examples ?? []) {
      if (!isStr(ex.target) || !isStr(ex.native)) err(`правило ${r.id}: пример без target/native`);
    }
  }

  const cards = Array.isArray(lesson.cards) ? lesson.cards : (err('cards должен быть массивом'), []);
  if (!cards.length) err('нет карточек');
  const cardIds = new Set();
  const answers = new Map();
  const byType = {};
  let unverified = 0;

  for (const c of cards) {
    const at = `карточка ${c.id ?? '?'}`;
    if (!isStr(c.id)) err('карточка без id');
    else if (cardIds.has(c.id)) err(`повторяется id карточки "${c.id}"`);
    cardIds.add(c.id);

    if (!TYPES.includes(c.type)) {
      err(`${at}: неизвестный type "${c.type}"`);
      continue;
    }
    byType[c.type] = (byType[c.type] ?? 0) + 1;
    if (!isStr(c.prompt)) err(`${at}: нет prompt`);
    if (!isStr(c.answer)) err(`${at}: нет answer`);
    if (c.rule !== undefined && !ruleIds.has(c.rule)) err(`${at}: правило "${c.rule}" не описано в rules`);
    for (const key of ['alt', 'diff', 'options', 'tags']) {
      if (c[key] !== undefined && !isStrArr(c[key])) err(`${at}: ${key} — массив строк`);
    }
    if (c.verified === false) unverified++;

    if (c.type === 'choice') {
      if (!Array.isArray(c.options) || c.options.length !== 2) err(`${at}: у choice ровно 2 варианта`);
      else if (!c.options.includes(c.answer)) err(`${at}: answer нет среди options`);
    }
    if (c.type === 'form') {
      if (!BLANK.test(c.prompt ?? '')) err(`${at}: в prompt формы нужен пропуск ___`);
      if (!isStr(c.lemma)) err(`${at}: у form нужен lemma`);
      if (c.full && !c.full.includes(c.answer)) err(`${at}: full не содержит answer`);
    }
    if (c.type === 'transform' && !isStr(c.task)) err(`${at}: у transform нужен task`);
    for (const d of c.diff ?? []) {
      if (isStr(c.answer) && !c.answer.includes(d)) err(`${at}: фрагмента diff "${d}" нет в answer`);
    }

    if (isStr(c.answer) && ['translate', 'transform', 'spot'].includes(c.type) && words(c.answer) > 14) {
      warn(`${at}: ответ длиннее 14 слов — слишком тяжело для вечера`);
    }
    if (isStr(c.answer) && c.type !== 'choice') {
      const key = `${c.type}:${c.answer.toLowerCase()}`;
      if (answers.has(key)) warn(`${at}: тот же ответ, что у ${answers.get(key)}`);
      answers.set(key, c.id);
    }
  }

  const types = Object.entries(byType)
    .map(([t, n]) => `${t} ${n}`)
    .join(', ');
  const extra = unverified ? `, на проверке ${unverified}` : '';
  console.log(`  ${where}: «${lesson.title}» — ${rules.length} правил, ${cards.length} карточек (${types}${extra})`);
}

for (const lang of LANGS) {
  const dir = join(ROOT, lang, 'lessons');
  if (!existsSync(dir)) continue;
  console.log(`${lang.toUpperCase()}`);
  for (const lesson of readdirSync(dir, { withFileTypes: true })) {
    if (lesson.isDirectory()) checkLesson(lang, lesson.name);
  }
}

console.log(`\n${errors ? `✗ ошибок: ${errors}` : '✓ ошибок нет'}${warnings ? `, предупреждений: ${warnings}` : ''}`);
process.exit(errors ? 1 : 0);
