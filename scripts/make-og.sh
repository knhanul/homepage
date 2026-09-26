#!/usr/bin/env bash
# OG 이미지(assets/og.png, 1200x630)를 다시 만들 때만 실행합니다. Google Chrome 필요.
set -euo pipefail
cd "$(dirname "$0")/.."
google-chrome --headless=new --no-sandbox --disable-gpu --hide-scrollbars --allow-file-access-from-files \
  --window-size=1200,630 --virtual-time-budget=6000 --screenshot="$PWD/assets/og.png" "file://$PWD/scripts/og/og.html"
echo "assets/og.png 생성 완료"
