// 사이트에서 쓰는 선(line) 아이콘 모음. 모두 24x24 viewBox, stroke 기반입니다.
const P = {
  play: '<rect x="3" y="4" width="18" height="16" rx="4"/><path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor" stroke="none"/>',
  film: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
  note: '<path d="M6 3h9l4 4v14H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5M8.5 12h7M8.5 16h5"/>',
  memo: '<path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9l-5 5H6a2 2 0 0 1-2-2z"/><path d="M15 20v-4a1 1 0 0 1 1-1h4M8 9h8M8 13h5"/>',
  desk: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4M7 9h4M7 12h6M15 9h2"/>',
  route: '<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8.2 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8"/>',
  weather: '<circle cx="8.5" cy="8.5" r="3"/><path d="M8.5 2.5v1M2.5 8.5h1M4.3 4.3l.7.7M12.7 4.3l-.7.7"/><path d="M9 20h8.5a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.3 1.2A2.9 2.9 0 0 0 9 20z"/>',
  mountain: '<path d="M3 19l6-10 4 6 2.5-3.5L21 19z"/><circle cx="17" cy="6" r="1.8"/>',
  chart: '<path d="M4 20V4M4 20h16"/><path d="M8 15l3.5-4 3 2.5L20 7"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19h14"/>',
  external: '<path d="M14 5h5v5M19 5l-8 8M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  code: '<path d="M8.5 8 4.5 12l4 4M15.5 8l4 4-4 4M13.5 5l-3 14"/>',
  news: '<path d="M5 5h11v14H6a1 1 0 0 1-1-1z"/><path d="M16 9h3v9a1 1 0 0 1-2 0V9M8 9h5M8 12.5h5M8 16h3"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  shield: '<path d="M12 3l7 3v5c0 4.4-3 8.3-7 10-4-1.7-7-5.6-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z"/>',
  github: '<path d="M9 19c-4 1.3-4-2-6-2.5M15 21v-3.5a3 3 0 0 0-.9-2.4c3-.3 6-1.4 6-6.5a5 5 0 0 0-1.4-3.5 4.6 4.6 0 0 0-.1-3.5s-1.1-.3-3.6 1.4a12.4 12.4 0 0 0-6.4 0C6.1 1.3 5 1.6 5 1.6a4.6 4.6 0 0 0-.1 3.5A5 5 0 0 0 3.5 8.6c0 5.1 3 6.2 6 6.5a3 3 0 0 0-.9 2.4V21"/>'
};
export function icon(name, cls = 'ico') {
  const body = P[name] || P.spark;
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
}
