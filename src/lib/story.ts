function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function toEditorHtml(value: string) {
  if (!value) return '';
  if (/<\/?[a-z][\s\S]*>/i.test(value)) return value;
  return value
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

export function storyHtml(value: string) {
  const html = toEditorHtml(value);
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/\sstyle\s*=\s*("([^"]*)"|'([^']*)')/gi, (_match, _full, doubleQuoted: string, singleQuoted: string) => {
      const style = doubleQuoted || singleQuoted || '';
      const align = style.match(/text-align\s*:\s*(left|center|right|justify)/i);
      return align ? ` style="text-align:${align[1].toLowerCase()}"` : '';
    });
}
