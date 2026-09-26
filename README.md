# nuni 홈페이지 (www.nuni.co.kr)

nuni 브랜드 소개, 제품 안내, 다운로드 링크, 운영 중인 서비스를 한 곳에 모은 **정적 홈페이지**입니다.
외부 패키지 없이 Node.js만으로 HTML을 만들고, 만들어진 파일(`dist/`)만 서버에 올립니다.
서버에서는 아무것도 빌드하거나 실행하지 않습니다(nginx가 파일만 보여 줍니다).

## 폴더 구조

```
homepage/
├─ data/                  ← 내용은 여기만 고치면 됩니다
│  ├─ site.json           사이트 이름·한 줄 소개·문의처·서비스(누니날씨, 파일 저장소)
│  ├─ products.json       제품 목록과 상세 내용(소개, 주요 기능, 스크린샷, 지원 환경)
│  ├─ downloads.json      다운로드 버튼 주소 (한 파일에 모음)
│  └─ news.json           소식 목록
├─ assets/                CSS, JS, 로고, 파비콘, 제품 스크린샷, OG 이미지
│  ├─ css/site.css
│  ├─ js/site.js          모바일 메뉴
│  └─ img/brand, img/products
├─ scripts/
│  ├─ build.mjs           data + assets → dist/ (HTML 생성)
│  ├─ icons.mjs           사이트에서 쓰는 선 아이콘
│  ├─ preview.mjs         내 PC에서 미리보기 (http://127.0.0.1:8088)
│  ├─ deploy.sh           빌드 후 서버에 올리기
│  ├─ make-og.sh          OG 이미지 다시 만들기(선택)
│  └─ og/og.html          OG 이미지 원본
├─ deploy/nginx/          서버 nginx 설정 원본(참고·복구용)
│  ├─ nuni-home
│  └─ 00-default-catchall
└─ dist/                  빌드 결과(자동 생성, Git에 올리지 않음)
```

만들어지는 페이지: 홈 `/`, 제품 `/products/`, 제품 상세 `/products/<slug>/`, 서비스 `/services/`,
다운로드 `/downloads/`, 소식 `/news/`, 소개·문의 `/about/`, 404 페이지, `sitemap.xml`, `robots.txt`.

## 내용 고치기

모든 파일은 JSON 형식입니다. 쉼표(`,`)와 따옴표(`"`)를 지우지 않도록 주의하세요.
고친 뒤 `node scripts/build.mjs`를 실행하면 형식이 틀린 곳을 알려 줍니다.

### 제품 추가·수정 — `data/products.json`

`items` 안에 제품 하나가 `{ ... }` 한 덩어리입니다.

| 항목 | 설명 |
|---|---|
| `slug` | 주소에 쓰는 영문 이름. `/products/<slug>/` |
| `name`, `nameEn` | 제품 이름(영문 병기는 선택) |
| `category` | `desktop`, `mobile`, `web` 중 하나 |
| `featured`, `order` | `true`면 홈 화면 대표 제품에 표시, `order` 순서대로 |
| `icon`, `tone` | 제품 타일 아이콘(`scripts/icons.mjs`의 이름)과 색(`blue`, `orange`, `violet`, `teal`, `green`, `navy`) |
| `tagline` | 카드에 나오는 한 줄 소개 |
| `summary` | 상세 페이지 ‘소개’ 문단(여러 개 가능) |
| `features` | ‘주요 기능’ 목록 (`title`, `text`) |
| `screenshots` | 실제 스크린샷만 넣습니다. 파일은 `assets/img/products/`에 두고 `src`, `width`, `height`, `alt`, `caption`을 적습니다. 없으면 `[]` |
| `platforms` | ‘지원 환경’ 목록 |
| `notes` | ‘참고’ 안내(선택) |
| `serviceUrl` | 웹 서비스 주소가 있으면 ‘서비스 열기’ 버튼이 생깁니다 |
| `source` | GitHub 주소 |

> 제품 문구는 각 저장소 README에 적힌 내용만 옮겼습니다. 버전·사용자 수처럼 확인되지 않은 내용은 적지 않았습니다.

### 다운로드 주소 바꾸기 — `data/downloads.json`

다운로드 버튼 주소는 **이 파일 한 곳**에만 있습니다. 지금은 모두 파일 저장소 첫 화면
`https://repo.nuni.co.kr/`(로그인 필요)로 연결됩니다. 저장소에서 공개 공유 링크(`/s/...`)나
공개된 ‘최신 버전 받기’ 주소를 만들면 해당 제품의 `url`만 바꾸세요.
목록에 제품을 추가하면 다운로드 페이지와 제품 상세의 다운로드 버튼이 함께 생깁니다(`product`는 products.json의 `slug`).

### 소식 쓰기 — `data/news.json`

`items` 맨 위에 추가합니다. `date`는 `YYYY-MM-DD`, `product`에 제품 `slug`를 적으면 그 제품 상세 페이지의
‘업데이트 기록’에도 나옵니다. 홈 화면에는 최근 3개가 보입니다.

### 문의 이메일 — `data/site.json`

`contact.email`이 비어 있으면 사이트에는 GitHub 링크만 표시됩니다. 공개할 이메일이 정해지면 적어 주세요.

## 미리보기

```bash
node scripts/build.mjs
node scripts/preview.mjs     # 브라우저에서 http://127.0.0.1:8088
```

## 배포

```bash
./scripts/deploy.sh
```

1. 이 PC에서 `dist/`를 빌드하고
2. `ssh -i ~/.ssh/id_ed25519_weatherhub root@74.208.148.96`으로 `/var/www/nuni`에 올립니다.
   새 폴더에 먼저 푼 뒤 한 번에 교체하고, 직전 버전은 `/var/www/nuni.prev`에 남겨 둡니다.
3. 마지막에 홈페이지가 200으로 응답하는지 확인합니다.

키 위치나 서버가 다르면 `SSH_KEY=... SERVER=root@... ./scripts/deploy.sh`처럼 지정합니다.
Windows에서는 Git Bash에서 실행하세요.

**되돌리기(직전 버전으로):**
```bash
ssh -i ~/.ssh/id_ed25519_weatherhub root@74.208.148.96 \
  'mv /var/www/nuni /var/www/nuni.bad && mv /var/www/nuni.prev /var/www/nuni'
```

## 서버 구성 (IONOS VPS, 74.208.148.96)

- 웹 루트: `/var/www/nuni`
- nginx: `/etc/nginx/sites-available/nuni-home` → `sites-enabled` 링크 (원본: `deploy/nginx/nuni-home`)
  - `nuni.co.kr`은 `www.nuni.co.kr`로 301 이동
  - HTML은 `no-cache`, `/assets/`는 30일 캐시(CSS/JS 주소에 `?v=해시`가 붙어 바뀌면 바로 반영)
  - 없는 주소는 `404.html`
- 기본 서버: `/etc/nginx/sites-available/00-default-catchall` (원본: `deploy/nginx/00-default-catchall`)
  - 등록되지 않은 호스트명은 HTTP 444(응답 없음), HTTPS는 핸드셰이크 거부
- 같은 서버의 `weather.nuni.co.kr`(누니날씨)은 그대로 운영됩니다.

nginx 설정을 바꿀 때는 항상 `nginx -t`로 검사한 뒤 `systemctl reload nginx` 하세요.

### 도메인 연결 후 HTTPS 켜기

hosting.co.kr DNS에 아래 두 레코드를 추가하고, 전파되면 서버에서 한 번 실행합니다.

| 호스트 | 종류 | 값 |
|---|---|---|
| `www` | A | `74.208.148.96` |
| `@` (nuni.co.kr) | A | `74.208.148.96` |

```bash
certbot --nginx -d www.nuni.co.kr -d nuni.co.kr
```

certbot이 인증서를 받고 `nuni-home` 파일에 443(HTTPS) 설정과 HTTP→HTTPS 이동을 추가합니다.
자동 갱신은 이미 켜져 있는 `certbot.timer`가 처리합니다.
