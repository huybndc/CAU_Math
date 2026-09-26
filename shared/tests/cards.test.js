import { describe, it, expect } from 'vitest';
import { splitCards, visibleWords, kindCards } from '../logic/cards.js';

describe('splitCards', () => {
  const md = '# Chương 1\n\n*Nguồn.*\n\n## 1. Thẻ một\nA b c.\n\n## Thẻ hai\nD.\n';
  it('bỏ tiêu đề # (topbar đã có), giữ phần mở đầu, mỗi ## là một thẻ', () => {
    const { intro, cards } = splitCards(md);
    expect(intro).toBe('*Nguồn.*');
    expect(cards.map(c => c.title)).toEqual(['Thẻ một', 'Thẻ hai']);   // bỏ số thứ tự "1."
    expect(cards[0].body).toBe('A b c.');
  });
});

describe('visibleWords', () => {
  it('không đếm phần gập, khối code, bảng và thẻ HTML', () => {
    const body = 'Một hai ba.\n\n```\nx y z w\n```\n\n| a | b |\n|---|---|\n\n<details><summary>Xem</summary>\nrất nhiều chữ ở đây\n</details>\n<div data-check="c1q:convert"></div>';
    expect(visibleWords(body)).toBe(3);
  });
});

describe('kindCards', () => {
  it('dạng → thẻ đầu tiên có data-check hoặc data-also', () => {
    const md = '## A\n<div data-check="p:x"></div>\n## B\n<div data-check="p:y" data-also="p:z p:x"></div>';
    expect([...kindCards(md)]).toEqual([['p:x', 0], ['p:y', 1], ['p:z', 1]]);
  });
});
