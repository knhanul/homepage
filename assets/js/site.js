// 모바일 메뉴 열기/닫기
(function () {
  var header = document.querySelector('.site-header');
  var btn = document.querySelector('.nav-toggle');
  if (!header || !btn) return;
  btn.addEventListener('click', function () {
    var open = header.classList.toggle('nav-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header.classList.contains('nav-open')) btn.click();
  });
})();
