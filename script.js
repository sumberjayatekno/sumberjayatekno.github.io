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

/* Formulir singkat sebelum membuka WhatsApp */
(function () {
  if (!window.HTMLDialogElement) return;
  var TOPICS = [
    ['pemasangan CCTV', 'CCTV'],
    ['jaringan LAN dan WiFi', 'Jaringan'],
    ['reparasi komputer atau laptop', 'Komputer'],
    ['server, NAS, dan backup data', ''],
    ['hal lainnya', '']
  ];
  var dlg, form, err, num = '';

  function build() {
    dlg = document.createElement('dialog');
    dlg.className = 'wa-dialog';
    dlg.setAttribute('aria-labelledby', 'wa-title');
    var opts = '<option value="" selected disabled>Pilih keperluan</option>' +
      TOPICS.map(function (t) { return '<option>' + t[0] + '</option>'; }).join('');
    dlg.innerHTML =
      '<form class="wa-form" novalidate>' +
      '<div class="wa-head"><h2 id="wa-title">Chat via WhatsApp</h2>' +
      '<button type="button" class="wa-x" aria-label="Tutup">&times;</button></div>' +
      '<p class="wa-sub">Isi data singkat, pesan akan tersusun otomatis di WhatsApp.</p>' +
      '<label>Nama Anda<input name="nama" type="text" autocomplete="name" maxlength="60" placeholder="Contoh: Budi" required></label>' +
      '<label>Keperluan<select name="topik" required>' + opts + '</select></label>' +
      '<label>Keterangan tambahan <span>(opsional)</span>' +
      '<textarea name="catatan" rows="3" maxlength="300" placeholder="Misalnya lokasi, jumlah kamera, atau jenis kerusakan"></textarea></label>' +
      '<p class="wa-err" role="alert" hidden></p>' +
      '<div class="wa-actions"><button type="button" class="btn wa-cancel">Batal</button>' +
      '<button type="submit" class="btn wa">Lanjut ke WhatsApp</button></div>' +
      '</form>';
    document.body.appendChild(dlg);
    form = dlg.querySelector('form');
    err = dlg.querySelector('.wa-err');
    dlg.querySelector('.wa-x').addEventListener('click', function () { dlg.close(); });
    dlg.querySelector('.wa-cancel').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nama = form.nama.value.trim();
      var topik = form.topik.value;
      var catatan = form.catatan.value.trim();
      if (!nama) { show('Mohon isi nama Anda.'); form.nama.focus(); return; }
      if (!topik) { show('Mohon pilih keperluan Anda.'); form.topik.focus(); return; }
      var msg = 'Halo Sumber Jaya Tekno, saya ' + nama + '. Saya mau bertanya tentang ' + topik + '.';
      if (catatan) msg += '\n\n' + catatan;
      var url = 'https://wa.me/' + num + '?text=' + encodeURIComponent(msg);
      dlg.close();
      if (!window.open(url, '_blank', 'noopener')) location.href = url;
    });
  }

  function show(m) { err.textContent = m; err.hidden = false; }

  function openDialog(href) {
    if (!dlg) build();
    var u = new URL(href);
    num = u.pathname.replace('/', '');
    var text = u.searchParams.get('text') || '';
    err.hidden = true;
    form.topik.selectedIndex = 0;
    TOPICS.forEach(function (t, i) {
      if (t[1] && new RegExp(t[1], 'i').test(text)) form.topik.selectedIndex = i + 1;
    });
    dlg.showModal();
    form.nama.focus();
  }

  document.addEventListener('click', function (e) {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
    var a = e.target.closest && e.target.closest('a[href^="https://wa.me/"][href*="text="]');
    if (!a) return;
    e.preventDefault();
    openDialog(a.href);
  });
})();
