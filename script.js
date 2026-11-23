(function () {
  var sel = 'main .stat, main .hero>.wrap, main section>.wrap, main .page>.wrap, main .pkg';
  var els = Array.prototype.slice.call(document.querySelectorAll(sel));
  if (!els.length) return;
  els.forEach(function (el) {
    var p = el.parentNode; p.__n = p.__n || 0;
    el.style.transitionDelay = Math.min(p.__n++, 5) * 70 + 'ms';
    el.classList.add('rv');
  });
  function show(el) {
    el.classList.add('in');
    setTimeout(function () {
      el.classList.remove('rv', 'in');
      el.style.transitionDelay = '';
    }, 1000);
  }
  if (!('IntersectionObserver' in window)) { els.forEach(show); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function (el) { io.observe(el); });
})();
