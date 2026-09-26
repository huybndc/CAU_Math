/* ---------------------------------------------------------------
   GỌI GEMINI API (REST, không cần SDK) — chỉ dùng trong pipeline soạn đề (D27),
   không bao giờ chạy trong app. Khoá lấy từ biến môi trường GEMINI_API_KEY
   (file .env ở gốc repo — .gitignore đã chặn, repo đang public).
   Trả lời ép dạng JSON theo `schema` (structured output) nên không phải bóc chữ.
   `fetchImpl` thay được để test không cần mạng.
   --------------------------------------------------------------- */

export const DEFAULT_MODEL = 'gemini-2.5-flash';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * @param {{ apiKey: string, model?: string, prompt: string, schema: object,
 *           temperature?: number, fetchImpl?: typeof fetch, retries?: number, wait?: (ms:number)=>Promise }} o
 * @returns {Promise<any>} JSON đã parse
 */
export async function callGemini({ apiKey, model = DEFAULT_MODEL, prompt, schema, temperature = 0.9,
  fetchImpl = globalThis.fetch, retries = 4, wait = sleep }) {
  if (!apiKey) throw new Error('Thiếu GEMINI_API_KEY (ghi vào file .env ở gốc repo: GEMINI_API_KEY=...)');
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json', responseSchema: schema, temperature },
  };
  for (let attempt = 0; ; attempt++) {
    const res = await fetchImpl(`${ENDPOINT}/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
    });
    // 429 (hết hạn mức phút) / 5xx: chờ lũy thừa rồi thử lại — lô đề không gấp
    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      await wait(2000 * 2 ** attempt);
      continue;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${data.error?.message ?? 'lỗi không rõ'}`);
    const cand = data.candidates?.[0];
    const text = cand?.content?.parts?.map(p => p.text ?? '').join('') ?? '';
    if (!text) throw new Error(`Gemini không trả nội dung (finishReason: ${cand?.finishReason ?? data.promptFeedback?.blockReason ?? '?'})`);
    try { return JSON.parse(text); } catch { throw new Error('Gemini trả JSON hỏng: ' + text.slice(0, 200)); }
  }
}
