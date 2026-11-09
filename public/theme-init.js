// Restore only the appearance preference before the first render.
(function () {
  var theme = 'light';
  try { if (localStorage.getItem('crona-atelier:theme:v1') === 'dark') theme = 'dark'; } catch {}
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]').setAttribute('content', theme === 'dark' ? '#1c1b19' : '#f5f1e8');
})();

