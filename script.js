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

  function openDialog(href, el) {
    if (!dlg) build();
    var u = new URL(href);
    num = u.pathname.replace('/', '');
    var text = u.searchParams.get('text') || '';
    err.hidden = true;
    form.catatan.value = (el && el.dataset && el.dataset.catatan) || '';
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
    openDialog(a.href, a);
  });
})();

/* Estimasi biaya kunjungan berdasarkan jarak */
(function () {
  var out = document.getElementById('calc-out');
  if (!out) return;
  // Pengaturan: ubah angka di sini bila perlu
  var ORIGIN = { lat: -6.1400, lon: 106.7350 }; // perkiraan titik tempat servis (Cengkareng Timur)
  var FREE_KM = 5, RATE = 10000, FACTOR = 1.4, FAR_KM = 30, WA = '6285711471040';
  // Perkiraan titik tengah kecamatan Jakarta Barat
  var KEC = {
    'Cengkareng': [-6.1485, 106.7300], 'Kalideres': [-6.1400, 106.7050],
    'Kembangan': [-6.1880, 106.7380], 'Kebon Jeruk': [-6.1900, 106.7680],
    'Grogol Petamburan': [-6.1650, 106.7870], 'Palmerah': [-6.2050, 106.7950],
    'Taman Sari': [-6.1490, 106.8160], 'Tambora': [-6.1450, 106.8030]
  };
  var btn = document.getElementById('calc-gps');
  var sel = document.getElementById('calc-kec');
  var btnLabel = btn.textContent;

  function rad(d) { return d * Math.PI / 180; }
  function haversine(a, b, c, d) {
    var R = 6371, dLat = rad(c - a), dLon = rad(d - b);
    var x = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  function rp(n) { return 'Rp' + n.toLocaleString('id-ID'); }
  function fmt(n) { return n.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }

  function message(text) {
    out.hidden = false;
    out.innerHTML = '';
    var p = document.createElement('p');
    p.textContent = text;
    p.style.margin = '0';
    out.appendChild(p);
  }

  function render(lat, lon, kecName, accuracy) {
    var straight = haversine(ORIGIN.lat, ORIGIN.lon, lat, lon);
    var road = straight * FACTOR;
    var excess = Math.max(0, road - FREE_KM);
    var kmBill = Math.ceil(excess - 1e-9);
    var fee = kmBill * RATE;
    var html = '<p>Estimasi jarak jalan: <b>' + fmt(road) + ' km</b>' +
      (kecName ? ' (dari titik tengah Kecamatan ' + kecName + ')' : '') + '</p>';
    if (fee === 0) {
      html += '<p><b>Gratis biaya transportasi</b>, masih dalam radius ' + FREE_KM + ' km.</p>';
    } else {
      html += '<p>Estimasi biaya transportasi: <b>' + rp(fee) + '</b> ' +
        '<span class="calc-note-inline">(kelebihan ' + fmt(excess) + ' km, dibulatkan ' + kmBill + ' km &times; ' + rp(RATE) + ')</span></p>';
    }
    if (accuracy && accuracy > 2000) {
      html += '<p class="calc-warn">Akurasi lokasi perangkat Anda rendah (sekitar ' + Math.round(accuracy) + ' m), hasil bisa meleset.</p>';
    }
    if (road > FAR_KM) {
      html += '<p class="calc-warn">Lokasi ini cukup jauh dari area layanan utama. Ketersediaan dan biaya dikonfirmasi lewat WhatsApp.</p>';
    }
    out.hidden = false;
    out.innerHTML = html;

    var ringkas = 'Estimasi jarak jalan sekitar ' + fmt(road) + ' km, estimasi biaya transportasi ' + (fee ? rp(fee) : 'gratis') + '.';
    var catatan = kecName
      ? 'Lokasi: Kecamatan ' + kecName + '. ' + ringkas
      : ringkas + '\nLokasi saya: https://maps.google.com/?q=' + lat.toFixed(5) + ',' + lon.toFixed(5);
    var a = document.createElement('a');
    a.className = 'btn wa';
    a.textContent = 'Tanyakan lewat WhatsApp';
    a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Halo Sumber Jaya Tekno, saya ingin menanyakan biaya kunjungan.');
    a.dataset.catatan = catatan;
    out.appendChild(a);
    if (!kecName) {
      var n = document.createElement('p');
      n.className = 'calc-note-inline';
      n.style.margin = '10px 0 0';
      n.textContent = 'Tautan lokasi hanya ikut terkirim bila Anda lanjut lewat tombol di atas, dan bisa dihapus di formulir sebelum dikirim.';
      out.appendChild(n);
    }
  }

  function reset() { btn.disabled = false; btn.textContent = btnLabel; }

  btn.addEventListener('click', function () {
    if (!navigator.geolocation) { message('Browser Anda tidak mendukung lokasi. Silakan pilih kecamatan.'); return; }
    sel.value = '';
    btn.disabled = true;
    btn.textContent = 'Mencari lokasi...';
    navigator.geolocation.getCurrentPosition(function (p) {
      reset();
      render(p.coords.latitude, p.coords.longitude, null, p.coords.accuracy);
    }, function (e) {
      reset();
      message(e.code === 1
        ? 'Izin lokasi ditolak. Silakan pilih kecamatan Anda di sebelah.'
        : 'Lokasi tidak dapat ditemukan. Silakan pilih kecamatan Anda di sebelah.');
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
  });

  sel.addEventListener('change', function () {
    var k = KEC[sel.value];
    if (k) render(k[0], k[1], sel.value, 0);
  });
})();
