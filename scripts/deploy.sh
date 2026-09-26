#!/usr/bin/env bash
# nuni 홈페이지 빌드 + 서버 배포
#   사용법:  ./scripts/deploy.sh
#   필요한 것: Node.js 18+, ssh, tar, 서버 접속 키(~/.ssh/id_ed25519_weatherhub)
# 서버에서는 빌드하지 않습니다. 이 PC에서 만든 dist/ 폴더만 올립니다.
set -euo pipefail
cd "$(dirname "$0")/.."

SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_ed25519_weatherhub}"
SERVER="${SERVER:-root@74.208.148.96}"
WEBROOT="${WEBROOT:-/var/www/nuni}"
SSH=(ssh -i "$SSH_KEY" -o BatchMode=yes -o ConnectTimeout=15 "$SERVER")

echo "▶ 1/3 빌드"
node scripts/build.mjs

echo "▶ 2/3 업로드 → $SERVER:$WEBROOT"
# 새 폴더에 먼저 풀고, 다 풀리면 한 번에 교체합니다. 직전 버전은 $WEBROOT.prev 에 남겨 둡니다.
tar -C dist -czf - . | "${SSH[@]}" "set -e
  rm -rf '$WEBROOT.new' && mkdir -p '$WEBROOT.new'
  tar -xzf - --no-same-owner -C '$WEBROOT.new'
  chmod -R u=rwX,go=rX '$WEBROOT.new'
  rm -rf '$WEBROOT.prev'
  if [ -d '$WEBROOT' ]; then mv '$WEBROOT' '$WEBROOT.prev'; fi
  mv '$WEBROOT.new' '$WEBROOT'
  echo \"  서버 반영 완료: \$(find '$WEBROOT' -type f | wc -l)개 파일\""

echo "▶ 3/3 확인"
code=$(curl -s -o /dev/null -w '%{http_code}' --resolve "www.nuni.co.kr:80:${SERVER#*@}" http://www.nuni.co.kr/ || true)
echo "  http://www.nuni.co.kr/ → HTTP $code"
[ "$code" = "200" ] || { echo "  ⚠ 응답이 200이 아닙니다. nginx 설정을 확인하세요."; exit 1; }
echo "✔ 배포 끝"
