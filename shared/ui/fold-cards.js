/* ---------------------------------------------------------------
   GẬP THẺ: các trang Ví dụ / Công cụ xếp nhiều thẻ dọc ⇒ cuộn dài. Mỗi thẻ cấp 1 có tiêu đề h2 thành mục gập
   (<details>), chỉ thẻ đầu mở sẵn. Nút/ô bên trong giữ nguyên (chỉ chuyển chỗ, không dựng lại) nên listener còn đó.
   --------------------------------------------------------------- */
export function foldCards(pane) {
  const cards = [...pane.children].filter(c => c.classList.contains('card') && c.querySelector(':scope > h2'));
  if (cards.length < 2) return;
  cards.forEach((card, k) => {
    const d = document.createElement('details');
    d.className = card.className + ' fold';
    d.open = k === 0;
    const sum = document.createElement('summary');
    sum.append(card.querySelector(':scope > h2'));
    const body = document.createElement('div');
    body.className = 'fold-body';
    body.append(...card.childNodes);
    d.append(sum, body);
    card.replaceWith(d);
  });
}
