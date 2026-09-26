#!/usr/bin/env node
// nuni 홈페이지 빌드 스크립트 (외부 패키지 없음, Node.js 18 이상)
// data/*.json + assets/ → dist/ 정적 사이트
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { icon } from './icons.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const read = (f) => JSON.parse(readFileSync(join(ROOT, 'data', f), 'utf8'));
const site = read('site.json');
const productData = read('products.json');
const downloads = read('downloads.json');
const news = read('news.json');

const products = [...productData.items].sort((a, b) => a.order - b.order);
const bySlug = Object.fromEntries(products.map((p) => [p.slug, p]));
const categories = productData.categories;
const catName = Object.fromEntries(categories.map((c) => [c.id, c.name]));
const dlByProduct = Object.fromEntries(downloads.items.map((d) => [d.product, d]));
const newsItems = [...news.items].sort((a, b) => b.date.localeCompare(a.date));
for (const d of downloads.items) if (!bySlug[d.product]) throw new Error(`downloads.json: 알 수 없는 제품 ${d.product}`);
for (const n of newsItems) if (n.product && !bySlug[n.product]) throw new Error(`news.json: 알 수 없는 제품 ${n.product}`);

// ---------- helpers ----------
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nl2br = (s) => esc(s).replace(/\n/g, '<br>');
const hashes = {};
const asset = (p) => {
  if (!hashes[p]) hashes[p] = createHash('sha1').update(readFileSync(join(ROOT, p.replace(/^\//, '')))).digest('hex').slice(0, 10);
  return `${p}?v=${hashes[p]}`;
};
const abs = (p) => site.url.replace(/\/$/, '') + p;
const fmtDate = (d) => { const [y, m, dd] = d.split('-'); return `${y}.${m}.${dd}`; };
const dlUrl = (slug) => (dlByProduct[slug] && dlByProduct[slug].url) || downloads.defaultUrl;
const ext = 'target="_blank" rel="noopener"';
const displayName = (p) => (p.nameEn ? `${esc(p.name)} <span class="en">${esc(p.nameEn)}</span>` : esc(p.name));

const tile = (p, size = '') => `<span class="tile tone-${esc(p.tone || 'blue')} ${size}">${icon(p.icon, 'tile-ico')}</span>`;

const NAV = [
  ['/', '홈'], ['/products/', '제품'], ['/services/', '서비스'], ['/downloads/', '다운로드'], ['/news/', '소식'], ['/about/', '소개']
];

function layout({ path, title, description, body, jsonld = null, noindex = false }) {
  const fullTitle = path === '/' ? `${site.name} — ${site.tagline}` : `${title} · ${site.name}`;
  const desc = description || site.description;
  const canonical = abs(path);
  const navLinks = NAV.map(([href, label]) => {
    const active = href === '/' ? path === '/' : path.startsWith(href);
    return `<a href="${href}"${active ? ' aria-current="page"' : ''}>${label}</a>`;
  }).join('');
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${canonical}">`}
<meta name="theme-color" content="#026EF8">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${abs(site.ogImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<link rel="stylesheet" href="${asset('/assets/css/site.css')}">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ''}
</head>
<body>
<a class="skip" href="#main">본문 바로가기</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="/" aria-label="nuni 홈"><img src="/assets/img/brand/nuni-logo.svg" alt="nuni" width="72" height="32"></a>
    <nav class="nav" id="site-nav" aria-label="주요 메뉴">${navLinks}</nav>
    <button class="nav-toggle" type="button" aria-controls="site-nav" aria-expanded="false" aria-label="메뉴 열기">${icon('menu', 'ico i-open')}${icon('close', 'ico i-close')}</button>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="wrap footer-inner">
    <div class="footer-brand">
      <img src="/assets/img/brand/nuni-logo.svg" alt="nuni" width="64" height="28">
      <p>${esc(site.tagline)}</p>
    </div>
    <nav class="footer-links" aria-label="바닥글 메뉴">
      ${NAV.slice(1).map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}
    </nav>
    <div class="footer-meta">
      ${site.contact.email ? `<a href="mailto:${esc(site.contact.email)}">${esc(site.contact.email)}</a>` : ''}
      <a href="${esc(site.contact.github)}" ${ext}>${icon('github', 'ico sm')} ${esc(site.contact.githubLabel)}</a>
      <span>© ${new Date().getFullYear()} nuni</span>
    </div>
  </div>
</footer>
<script src="${asset('/assets/js/site.js')}" defer></script>
</body>
</html>
`;
}

// ---------- components ----------
function productActions(p, { compact = false } = {}) {
  const out = [];
  out.push(`<a class="btn ${compact ? 'sm ghost' : 'ghost'}" href="/products/${p.slug}/">자세히</a>`);
  if (dlByProduct[p.slug]) out.push(`<a class="btn ${compact ? 'sm' : ''} primary" href="${esc(dlUrl(p.slug))}" ${ext}>${icon('download', 'ico sm')}다운로드</a>`);
  else if (p.serviceUrl) out.push(`<a class="btn ${compact ? 'sm' : ''} primary" href="${esc(p.serviceUrl)}" ${ext}>${icon('external', 'ico sm')}바로가기</a>`);
  return out.join('');
}

function productCard(p) {
  return `<article class="card product-card">
  <a class="card-link" href="/products/${p.slug}/" aria-label="${esc(p.name)} 자세히 보기"></a>
  <div class="pc-head">${tile(p)}<div><h3>${esc(p.name)}</h3><span class="chip">${esc(catName[p.category])}</span></div></div>
  <p class="pc-text">${esc(p.tagline)}</p>
  <div class="pc-actions">${productActions(p, { compact: true })}</div>
</article>`;
}

function serviceCard(s) {
  const live = s.status === 'live';
  return `<a class="card service-card" href="${esc(s.url)}" ${ext}>
  <span class="svc-ico ${live ? 'live' : 'locked'}">${icon(s.icon)}</span>
  <span class="svc-body">
    <span class="svc-top"><strong>${esc(s.name)}</strong><span class="status ${live ? 'is-live' : 'is-login'}">${live ? '<i class="dot"></i>' : icon('lock', 'ico xs')}${esc(s.statusLabel)}</span></span>
    <span class="svc-desc">${esc(s.description)}</span>
    <span class="svc-host">${esc(s.host)} ${icon('external', 'ico xs')}</span>
  </span>
</a>`;
}

function newsList(items, { withProduct = true } = {}) {
  return `<ol class="news-list">${items.map((n) => `<li class="news-item">
  <div class="news-meta"><time datetime="${n.date}">${fmtDate(n.date)}</time><span class="chip ${n.tag === '서비스' ? 'chip-navy' : n.tag === '브랜드' ? 'chip-orange' : ''}">${esc(n.tag)}</span></div>
  <div class="news-body">
    <h3>${esc(n.title)}</h3>
    <p>${esc(n.body)}</p>
    <div class="news-links">
      ${withProduct && n.product ? `<a href="/products/${n.product}/">${esc(bySlug[n.product].name)} 자세히 ${icon('arrow', 'ico xs')}</a>` : ''}
      ${n.link ? `<a href="${esc(n.link)}" ${ext}>${esc(n.link.replace(/^https?:\/\//, ''))} ${icon('external', 'ico xs')}</a>` : ''}
    </div>
  </div>
</li>`).join('')}</ol>`;
}

const pageHead = (eyebrow, title, lead) => `<section class="page-head"><div class="wrap">
  <p class="eyebrow">${esc(eyebrow)}</p><h1>${esc(title)}</h1>${lead ? `<p class="lead">${nl2br(lead)}</p>` : ''}
</div></section>`;

// ---------- pages ----------
const pages = {};

// 홈
{
  const featured = products.filter((p) => p.featured);
  const counts = categories.map((c) => ({ ...c, n: products.filter((p) => p.category === c.id).length }));
  const body = `
<section class="hero">
  <div class="hero-bg" aria-hidden="true"><span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span></div>
  <div class="wrap hero-inner">
    <div class="hero-text">
      <p class="eyebrow">nuni software</p>
      <h1>${(site.heroTitle || [site.tagline]).map((l, i, a) => i === a.length - 1 && a.length > 1 ? `<span class="grad">${esc(l)}</span>` : esc(l)).join('<br>')}</h1>
      <p class="lead">${nl2br(site.heroLead)}</p>
      <div class="hero-cta">
        <a class="btn primary lg" href="/products/">제품 둘러보기 ${icon('arrow', 'ico sm')}</a>
        <a class="btn ghost lg" href="/downloads/">${icon('download', 'ico sm')}다운로드</a>
      </div>
      <ul class="hero-stats">${counts.map((c) => `<li><strong>${c.n}</strong><span>${esc(c.name)}</span></li>`).join('')}</ul>
    </div>
    <div class="hero-visual" aria-hidden="true">
      <div class="logo-card">
        <img src="/assets/img/brand/nuni-logo.svg" alt="" width="320" height="142">
        <div class="logo-card-foot">
          ${featured.slice(0, 5).map((p) => tile(p, 'mini')).join('')}
        </div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><div><p class="eyebrow">Products</p><h2>대표 제품</h2></div><a class="more" href="/products/">전체 제품 ${icon('arrow', 'ico sm')}</a></div>
    <div class="grid cards-3">${featured.map(productCard).join('')}</div>
  </div>
</section>

<section class="section alt">
  <div class="wrap">
    <div class="section-head"><div><p class="eyebrow">Live services</p><h2>바로 가기</h2></div><a class="more" href="/services/">서비스 안내 ${icon('arrow', 'ico sm')}</a></div>
    <div class="grid cards-2">${site.services.map(serviceCard).join('')}</div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><div><p class="eyebrow">News</p><h2>최근 소식</h2></div><a class="more" href="/news/">모든 소식 ${icon('arrow', 'ico sm')}</a></div>
    ${newsList(newsItems.slice(0, 3))}
  </div>
</section>`;
  pages['/'] = layout({
    path: '/', body,
    jsonld: { '@context': 'https://schema.org', '@type': 'Organization', name: 'nuni', url: site.url, logo: abs('/assets/icon-512.png'), description: site.description, sameAs: [site.contact.github] }
  });
}

// 제품 목록
{
  const body = `${pageHead('Products', '제품', '데스크톱 프로그램, 모바일 앱, 웹 서비스로 나누어 소개합니다.')}
<section class="section tight">
  <div class="wrap">
    <nav class="cat-tabs" aria-label="제품 분류">${categories.map((c) => `<a href="#${c.id}">${esc(c.name)} <span>${products.filter((p) => p.category === c.id).length}</span></a>`).join('')}</nav>
    ${categories.map((c) => `<div class="cat-block" id="${c.id}">
      <div class="cat-head"><h2>${esc(c.name)}</h2><span class="cat-sub">${esc(c.sub)}</span><p>${esc(c.description)}</p></div>
      <div class="grid cards-3">${products.filter((p) => p.category === c.id).map(productCard).join('')}</div>
    </div>`).join('')}
  </div>
</section>`;
  pages['/products/'] = layout({ path: '/products/', title: '제품', description: 'nuni의 Windows 데스크톱 프로그램, 모바일 앱, 웹 서비스 목록입니다.', body });
}

// 제품 상세
for (const p of products) {
  const dl = dlByProduct[p.slug];
  const related = newsItems.filter((n) => n.product === p.slug);
  const actions = [];
  if (dl) actions.push(`<a class="btn primary lg" href="${esc(dlUrl(p.slug))}" ${ext}>${icon('download', 'ico sm')}${esc(downloads.buttonLabel)}</a>`);
  if (p.serviceUrl) actions.push(`<a class="btn primary lg" href="${esc(p.serviceUrl)}" ${ext}>${icon('external', 'ico sm')}서비스 열기</a>`);
  if (p.source) actions.push(`<a class="btn ghost lg" href="${esc(p.source)}" ${ext}>${icon('github', 'ico sm')}GitHub</a>`);
  const toc = [['intro', '소개'], ['features', '주요 기능']];
  if (p.screenshots.length) toc.push(['screens', '스크린샷']);
  toc.push(['env', '지원 환경']);
  if (dl || p.serviceUrl) toc.push(['get', dl ? '다운로드' : '바로가기']);
  if (related.length) toc.push(['history', '업데이트 기록']);

  const body = `
<section class="product-hero">
  <div class="hero-bg" aria-hidden="true"><span class="blob b1"></span><span class="blob b2"></span></div>
  <div class="wrap">
    <nav class="crumbs" aria-label="현재 위치"><a href="/">홈</a><span>/</span><a href="/products/">제품</a><span>/</span><a href="/products/#${p.category}">${esc(catName[p.category])}</a></nav>
    <div class="ph-inner">
      ${tile(p, 'xl')}
      <div class="ph-text">
        <span class="chip">${esc(catName[p.category])}</span>
        <h1>${displayName(p)}</h1>
        <p class="lead">${esc(p.tagline)}</p>
        <div class="ph-actions">${actions.join('')}</div>
        ${dl ? `<p class="hint">${icon('lock', 'ico xs')} 설치 파일은 nuni 파일 저장소에서 받습니다(로그인 필요).</p>` : ''}
      </div>
    </div>
  </div>
</section>
<div class="wrap detail">
  <aside class="detail-toc" aria-label="목차"><ul>${toc.map(([id, l]) => `<li><a href="#${id}">${l}</a></li>`).join('')}</ul></aside>
  <div class="detail-body">
    <section id="intro" class="d-sec"><h2>소개</h2>${p.summary.map((s) => `<p>${esc(s)}</p>`).join('')}</section>
    <section id="features" class="d-sec"><h2>주요 기능</h2>
      <ul class="feature-grid">${p.features.map((f) => `<li><span class="f-ico">${icon('check', 'ico sm')}</span><div><strong>${esc(f.title)}</strong><p>${esc(f.text)}</p></div></li>`).join('')}</ul>
    </section>
    ${p.screenshots.length ? `<section id="screens" class="d-sec"><h2>스크린샷</h2>
      <div class="shots">${p.screenshots.map((s) => `<figure class="shot"><a href="${s.src}" ${ext}><img src="${s.src}" alt="${esc(s.alt)}" width="${s.width}" height="${s.height}" loading="lazy" decoding="async"></a><figcaption>${esc(s.caption)}</figcaption></figure>`).join('')}</div>
    </section>` : ''}
    <section id="env" class="d-sec"><h2>지원 환경</h2>
      <ul class="env-list">${p.platforms.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      ${p.notes.length ? `<div class="notes"><strong>참고</strong><ul>${p.notes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
    </section>
    ${dl ? `<section id="get" class="d-sec"><h2>다운로드</h2>
      <div class="get-box">
        <div><strong>${esc(p.name)}</strong><span>${esc(dl.platform)}${dl.format ? ` · ${esc(dl.format)}` : ''}</span>${dl.note ? `<small>${esc(dl.note)}</small>` : ''}</div>
        <a class="btn primary" href="${esc(dlUrl(p.slug))}" ${ext}>${icon('download', 'ico sm')}${esc(downloads.buttonLabel)}</a>
      </div>
      <p class="hint">최신 버전과 변경 내용은 저장소의 프로젝트 페이지에서 확인할 수 있습니다. 저장소는 로그인이 필요합니다.</p>
    </section>` : p.serviceUrl ? `<section id="get" class="d-sec"><h2>바로가기</h2>
      <div class="get-box"><div><strong>${esc(p.name)}</strong><span>${esc(p.serviceUrl.replace(/^https?:\/\//, ''))}</span></div>
      <a class="btn primary" href="${esc(p.serviceUrl)}" ${ext}>${icon('external', 'ico sm')}서비스 열기</a></div>
    </section>` : ''}
    ${related.length ? `<section id="history" class="d-sec"><h2>업데이트 기록</h2>${newsList(related, { withProduct: false })}</section>` : ''}
    <a class="back" href="/products/">${icon('arrow', 'ico sm flip')} 제품 목록으로</a>
  </div>
</div>`;
  pages[`/products/${p.slug}/`] = layout({
    path: `/products/${p.slug}/`, title: p.nameEn ? `${p.name} (${p.nameEn})` : p.name, description: `${p.name} — ${p.tagline}`, body,
    jsonld: { '@context': 'https://schema.org', '@type': p.category === 'web' ? 'WebApplication' : 'SoftwareApplication', name: p.name, description: p.tagline, applicationCategory: p.category === 'web' ? 'WebApplication' : 'UtilitiesApplication', operatingSystem: p.platforms[0], url: abs(`/products/${p.slug}/`), publisher: { '@type': 'Organization', name: 'nuni', url: site.url } }
  });
}

// 서비스
{
  const body = `${pageHead('Services', '서비스', 'nuni가 직접 운영하는 온라인 서비스입니다.')}
<section class="section tight"><div class="wrap">
  <div class="svc-list">${site.services.map((s) => {
    const p = s.productSlug && bySlug[s.productSlug];
    return `<article class="card svc-row">
      <span class="svc-ico lg ${s.status === 'live' ? 'live' : 'locked'}">${icon(s.icon)}</span>
      <div class="svc-row-body">
        <div class="svc-top"><h2>${esc(s.name)} <span class="en">${esc(s.nameEn)}</span></h2><span class="status ${s.status === 'live' ? 'is-live' : 'is-login'}">${s.status === 'live' ? '<i class="dot"></i>' : icon('lock', 'ico xs')}${esc(s.statusLabel)}</span></div>
        <p>${esc(s.description)}</p>
        <div class="svc-actions">
          <a class="btn primary" href="${esc(s.url)}" ${ext}>${icon('external', 'ico sm')}${esc(s.host)}</a>
          ${p ? `<a class="btn ghost" href="/products/${p.slug}/">서비스 소개</a>` : ''}
        </div>
      </div>
    </article>`;
  }).join('')}</div>
  <p class="hint center">저장소(repo.nuni.co.kr)는 로그인한 사용자만 이용할 수 있습니다.</p>
</div></section>`;
  pages['/services/'] = layout({ path: '/services/', title: '서비스', description: '누니날씨(weather.nuni.co.kr), nuni 파일 저장소 등 nuni가 운영하는 온라인 서비스 안내입니다.', body });
}

// 다운로드
{
  const rows = downloads.items.map((d) => {
    const p = bySlug[d.product];
    return `<tr>
      <td class="t-prod"><a href="/products/${p.slug}/">${tile(p, 'sm')}<span><strong>${esc(p.name)}</strong><small>${esc(p.tagline)}</small></span></a></td>
      <td class="t-plat" data-label="지원 환경">${esc(d.platform)}${d.format ? `<small>${esc(d.format)}</small>` : ''}</td>
      <td class="t-note${d.note ? '' : ' is-empty'}" data-label="참고">${d.note ? esc(d.note) : '<span class="muted">—</span>'}</td>
      <td class="t-act"><a class="btn primary sm" href="${esc(d.url || downloads.defaultUrl)}" ${ext}>${icon('download', 'ico sm')}${esc(downloads.buttonLabel)}</a></td>
    </tr>`;
  }).join('');
  const body = `${pageHead('Downloads', '다운로드', '설치해서 쓰는 nuni 프로그램 목록입니다.')}
<section class="section tight"><div class="wrap">
  <div class="notice">${icon('lock', 'ico sm')}<span>${esc(downloads.notice)}</span></div>
  <div class="card table-card">
    <table class="dl-table">
      <thead><tr><th scope="col">제품</th><th scope="col">지원 환경</th><th scope="col">참고</th><th scope="col"><span class="sr">다운로드</span></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
  <p class="hint center">웹 서비스는 설치 없이 <a href="/services/">서비스</a> 메뉴에서 바로 이용할 수 있습니다.</p>
</div></section>`;
  pages['/downloads/'] = layout({ path: '/downloads/', title: '다운로드', description: 'nuni player, NUNI Studio, Nuni Note, 누니메모, NuniDesk, nuni track 설치 파일 안내입니다.', body });
}

// 소식
{
  const body = `${pageHead('News', '소식', '제품과 서비스의 새 소식을 전합니다.')}
<section class="section tight"><div class="wrap narrow">${newsList(newsItems)}</div></section>`;
  pages['/news/'] = layout({ path: '/news/', title: '소식', description: 'nuni 제품과 서비스의 업데이트 소식입니다.', body });
}

// 소개 / 문의
{
  const counts = categories.map((c) => ({ ...c, list: products.filter((p) => p.category === c.id) }));
  const principles = [
    { icon: 'shield', title: '내 데이터는 내 기기에서', text: 'nuni player는 사용자가 가진 로컬 파일만 재생하고, GPX Viewer는 파일을 서버로 보내지 않고 브라우저 안에서만 분석합니다.' },
    { icon: 'check', title: '있는 그대로의 데이터', text: '누니날씨는 관측값이 없는 강수를 0으로 바꾸지 않고, 비어 있는 구간을 그대로 보여 줍니다.' },
    { icon: 'globe', title: '한국어 우선', text: '메뉴와 안내를 한국어로 먼저 만들고, 한글(HWP/HWPX) 문서 같은 국내 환경을 함께 고려합니다.' }
  ];
  const body = `${pageHead('About', 'nuni 소개', site.description)}
<section class="section tight"><div class="wrap">
  <div class="about-grid">
    <div class="card about-logo">
      <img src="/assets/img/brand/nuni-logo.svg" alt="nuni 영문 로고" width="240" height="106">
      <img src="/assets/img/brand/nuni-ko-logo.svg" alt="누니 한글 로고" width="170" height="96" class="ko">
    </div>
    <div class="about-text">
      <h2>무엇을 만드나요</h2>
      <ul class="make-list">${counts.map((c) => `<li><strong>${esc(c.name)}</strong><span>${c.list.map((p) => `<a href="/products/${p.slug}/">${esc(p.name)}</a>`).join(', ')}</span></li>`).join('')}</ul>
    </div>
  </div>
  <h2 class="sub-title">만드는 방식</h2>
  <div class="grid cards-3">${principles.map((x) => `<div class="card principle">${`<span class="p-ico">${icon(x.icon)}</span>`}<h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div>`).join('')}</div>
  <h2 class="sub-title" id="contact">문의</h2>
  <div class="card contact-card">
    <div><strong>제품이나 서비스에 대해 문의하실 내용이 있나요?</strong><p>${site.contact.email ? '아래 이메일이나 GitHub로 연락해 주세요.' : 'GitHub에서 연락해 주세요.'}</p></div>
    <div class="contact-actions">
      ${site.contact.email ? `<a class="btn primary" href="mailto:${esc(site.contact.email)}">${esc(site.contact.email)}</a>` : ''}
      <a class="btn ${site.contact.email ? 'ghost' : 'primary'}" href="${esc(site.contact.github)}" ${ext}>${icon('github', 'ico sm')}${esc(site.contact.githubLabel)}</a>
    </div>
  </div>
</div></section>`;
  pages['/about/'] = layout({ path: '/about/', title: '소개 · 문의', description: 'nuni 브랜드 소개와 문의 안내입니다.', body });
}

// 404
pages['/404.html'] = layout({
  path: '/404.html', title: '페이지를 찾을 수 없습니다', noindex: true,
  body: `<section class="notfound"><div class="wrap">
  <img src="/assets/img/brand/nuni-icon.svg" alt="" width="88" height="88">
  <p class="eyebrow">404</p><h1>페이지를 찾을 수 없습니다</h1>
  <p class="lead">주소가 바뀌었거나 삭제된 페이지입니다.</p>
  <div class="hero-cta center"><a class="btn primary" href="/">홈으로</a><a class="btn ghost" href="/products/">제품 보기</a></div>
</div></section>`
});

// ---------- write ----------
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
cpSync(join(ROOT, 'assets'), join(DIST, 'assets'), { recursive: true });
cpSync(join(ROOT, 'assets', 'favicon.ico'), join(DIST, 'favicon.ico'));
for (const [path, html] of Object.entries(pages)) {
  const file = path.endsWith('.html') ? join(DIST, path) : join(DIST, path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}
const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const urls = Object.keys(pages).filter((p) => !p.endsWith('.html'));
writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${abs(u)}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`);
console.log(`빌드 완료: ${Object.keys(pages).length}개 페이지 → dist/`);
