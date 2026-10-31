// TARGET = gốc Worker app thật, truyền lúc deploy (--var), không ghi vào repo công khai.
export function target(url, base) {
  const u = new URL(url);
  return base.replace(/\/$/, '') + u.pathname + u.search;
}

export default {
  fetch: (req, env) => Response.redirect(target(req.url, env.TARGET), 302),
};
