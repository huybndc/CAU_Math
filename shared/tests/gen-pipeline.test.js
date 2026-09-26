import { describe, it, expect } from 'vitest';
import { callGemini } from '../../scripts/gen/gemini.js';
import { buildPrompt, RESPONSE_SCHEMA } from '../../scripts/gen/prompt.js';
import { pickSection, avoidFor, normalizeRaw, processBatch } from '../../scripts/gen/pipeline.js';
import { parseArgs } from '../../scripts/gen/subjects.js';
import { SUBJECT_TOPICS, sectionIds } from '../../scripts/gen/topics.js';
import { verifyCheck } from '../../logic/src/logic/concept-check.js';

/* Pipeline soạn đề bằng Gemini (D27) — test không cần mạng: fetch giả. */

const lang = q => ({ q, options: ['one', 'two', 'three', 'four'], why: ['a', 'b', 'c', 'd'], explain: 'e' });
const raw = (over = {}) => ({ section: '1.6', type: 'apply', answer: 0, vi: lang('Số này là gì?'), en: lang('What is this number?'), check_json: '', ...over });

function fakeFetch(replies) {
  const calls = [];
  const fn = async (url, init) => {
    calls.push({ url, init });
    const r = replies.shift();
    return { ok: r.status === 200, status: r.status, json: async () => r.body };
  };
  fn.calls = calls;
  return fn;
}
const reply = obj => ({ status: 200, body: { candidates: [{ content: { parts: [{ text: JSON.stringify(obj) }] } }] } });

describe('gọi Gemini', () => {
  it('gửi prompt + schema, khoá ở header (không nằm trên URL), trả JSON đã parse', async () => {
    const f = fakeFetch([reply({ items: [1] })]);
    const out = await callGemini({ apiKey: 'K', model: 'm-1', prompt: 'P', schema: RESPONSE_SCHEMA, fetchImpl: f });
    expect(out).toEqual({ items: [1] });
    expect(f.calls[0].url).toMatch(/models\/m-1:generateContent$/);
    expect(f.calls[0].init.headers['x-goog-api-key']).toBe('K');
    const body = JSON.parse(f.calls[0].init.body);
    expect(body.generationConfig.responseMimeType).toBe('application/json');
    expect(body.contents[0].parts[0].text).toBe('P');
  });

  it('429 / 5xx thì chờ rồi thử lại; lỗi khác báo rõ', async () => {
    const waits = [];
    const f = fakeFetch([{ status: 429, body: {} }, { status: 503, body: {} }, reply({ ok: 1 })]);
    expect(await callGemini({ apiKey: 'K', prompt: 'P', schema: {}, fetchImpl: f, wait: async ms => waits.push(ms) })).toEqual({ ok: 1 });
    expect(waits).toEqual([2000, 4000]);
    const bad = fakeFetch([{ status: 400, body: { error: { message: 'API key not valid' } } }]);
    await expect(callGemini({ apiKey: 'K', prompt: 'P', schema: {}, fetchImpl: bad })).rejects.toThrow('API key not valid');
    await expect(callGemini({ apiKey: '', prompt: 'P', schema: {} })).rejects.toThrow('GEMINI_API_KEY');
  });

  it('bị chặn / trả rỗng / JSON hỏng thì báo lỗi', async () => {
    const blocked = fakeFetch([{ status: 200, body: { candidates: [{ finishReason: 'SAFETY' }] } }]);
    await expect(callGemini({ apiKey: 'K', prompt: 'P', schema: {}, fetchImpl: blocked })).rejects.toThrow('SAFETY');
    const broken = fakeFetch([{ status: 200, body: { candidates: [{ content: { parts: [{ text: '{"items": [' }] } }] } }]);
    await expect(callGemini({ apiKey: 'K', prompt: 'P', schema: {}, fetchImpl: broken })).rejects.toThrow('JSON hỏng');
  });
});

describe('prompt', () => {
  it('nêu mục, chỗ hay sai, số câu, các dạng check của Logic và câu cần tránh', () => {
    const section = SUBJECT_TOPICS.logic.chapters.ch1.find(s => s.id === '1.5');
    const p = buildPrompt({ subject: 'logic', section, n: 6, avoid: ['Old question?'] });
    expect(p).toMatch('section 1.5');
    expect(p).toMatch(section.focus);
    expect(p).toMatch('exactly 6 questions');
    expect(p).toMatch('"type":"signed"');
    expect(p).toMatch('- Old question?');
  });

  it('môn chưa có bộ kiểm: dặn để check_json trống', () => {
    const section = SUBJECT_TOPICS.linalg.chapters.ch2[0];
    expect(buildPrompt({ subject: 'linalg', section, n: 3 })).toMatch('Set "check_json" to ""');
  });
});

describe('xử lý một lô', () => {
  it('pickSection: mục ít câu nhất (trong chương nếu có), hoặc đúng mục chỉ định', () => {
    const ex = [{ section: '1.2' }, { section: '1.3' }];
    expect(pickSection('logic', { chapter: 'ch1' }, ex).id).toBe('1.4');
    expect(pickSection('logic', { section: '3.5' }, ex)).toMatchObject({ id: '3.5', chapter: 'ch3' });
    expect(() => pickSection('logic', { section: '9.9' })).toThrow();
    expect(avoidFor('1.2', [{ section: '1.2', en: { q: 'Q?' } }, { section: '1.3', en: { q: 'R?' } }])).toEqual(['Q?']);
  });

  it('normalizeRaw đọc check_json; hỏng thì giữ lại để bị loại', () => {
    expect(normalizeRaw(raw({ check_json: '{"type":"gray","bin":"1","gray":"1"}' }), { chapter: 'ch1', id: 'l1-x', source: 's' }).check)
      .toEqual({ type: 'gray', bin: '1', gray: '1' });
    expect(normalizeRaw(raw(), { chapter: 'ch1', id: 'l1-x' }).check).toBeUndefined();
    expect(normalizeRaw(raw({ check_json: '{oops' }), { chapter: 'ch1', id: 'l1-x' }).check.type).toBe('json-hỏng');
  });

  it('câu có phép tính SAI bị loại, câu đúng vào hàng chờ, câu trùng ý bị loại', () => {
    const batch = [
      raw({ check_json: JSON.stringify({ type: 'signed', bits: '11111010', format: 'twos', value: -6 }) }),
      raw({ en: lang('Which value do these bits encode?'), check_json: JSON.stringify({ type: 'signed', bits: '11111010', format: 'twos', value: -5 }) }),
      raw({ en: lang('What is this number?') }),                // trùng câu đầu
      raw({ section: '2.4' }),                                   // mục không thuộc ch1
    ];
    const { accepted, rejected } = processBatch(batch, { subject: 'logic', chapter: 'ch1', idPrefix: 'l', source: 'gemini-x', verify: verifyCheck, stamp: 'z' });
    expect(accepted.map(it => it.id)).toEqual(['l1-z0']);
    expect(accepted[0]).toMatchObject({ chapter: 'ch1', source: 'gemini-x' });
    expect(rejected.map(r => r.errors.join())).toEqual([
      expect.stringMatching('check sai'), expect.stringMatching('trùng ý'), expect.stringMatching('mục lạ'),
    ]);
  });

  it('danh sách mục khớp khoá chương của app Logic', () => {
    expect(Object.keys(sectionIds('logic'))).toEqual(['ch1', 'ch2', 'ch3', 'ch4']);
  });

  it('parseArgs', () => {
    expect(parseArgs(['--subject', 'logic', '--dry', '--n', '5'])).toEqual({ subject: 'logic', dry: true, n: '5' });
  });
});
