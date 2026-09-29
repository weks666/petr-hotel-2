export const basePath = (process.env.BASE_PATH || '').replace(/\/$/, '');
if (basePath && !/^\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(basePath)) {
  throw new Error('BASE_PATH must be a clean absolute URL path, without a trailing slash.');
}

// Source templates use root-relative URLs. Only local URL attributes/CSS/JSON
// are rebased; external booking URLs, fragments and text remain unchanged.
export const withBase = value => typeof value === 'string' && /^\/(?!\/)/.test(value)
  ? basePath + value : value;
export const rebaseHtml = html => html.replace(/\b(href|src|action|poster)="(\/(?!\/)[^"]*)"/g,
  (_, attribute, value) => `${attribute}="${withBase(value)}"`);
export const rebaseCss = css => css.replace(/url\((['"]?)(\/(?!\/)[^)'"\s]+)\1\)/g,
  (_, quote, value) => `url(${quote}${withBase(value)}${quote})`);
export const rebaseData = data => JSON.stringify(data, (_, value) => withBase(value));
