import { describe, it, expect } from 'vitest';
import worker, { target } from '../../redirect/index.js';

describe('exlab chuyển hướng', () => {
  it('giữ path và query', () => {
    expect(target('https://exlab.x.dev/linalg/?a=1#h', 'https://app.x.dev/')).toBe('https://app.x.dev/linalg/?a=1');
    expect(target('https://exlab.x.dev/', 'https://app.x.dev')).toBe('https://app.x.dev/');
  });
  it('trả 302', () => {
    const r = worker.fetch(new Request('https://exlab.x.dev/logic/'), { TARGET: 'https://app.x.dev' });
    expect(r.status).toBe(302);
    expect(r.headers.get('Location')).toBe('https://app.x.dev/logic/');
  });
});
