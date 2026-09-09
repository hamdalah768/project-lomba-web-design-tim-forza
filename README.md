# LokaNaik Digital Stage

Website statis multi-halaman yang dikembangkan dari arsip desain **Digital Stage for Local Growth**. Tema visualnya mempertahankan panggung midnight navy, glassmorphism, orbit, serta aksen emas/cobalt/lime dengan visual produk dan roadmap abstrak berbasis CSS/SVG.

## Jalankan di VS Code

1. Ekstrak ZIP lalu buka folder hasil ekstraknya di VS Code.
2. Jalankan server lokal dari folder tersebut:

   ```bash
   python -m http.server 4173
   ```

3. Buka `http://localhost:4173`.

Tidak ada build step, framework, atau `node_modules`. Semua halaman menggunakan HTML, CSS, dan JavaScript vanilla sehingga mudah dipelajari dan diubah.

## Halaman yang tersedia

- `index.html` — beranda/panggung utama
- `login.html` — akses lokal Google, Facebook, Apple, email, dan nomor HP + OTP simulasi
- `search.html` — pencarian dan filter modul
- `learn.html` — ruang belajar dengan checklist progress
- `path.html` — jalur belajar bertahap dengan roadmap
- `studio.html` — pembuat kartu katalog realtime dan export HTML
- `stories.html` — cerita lokal dengan filter dan modal detail
- `brand.html` — sistem identitas visual LokaNaik

## Catatan login dan keamanan

Login sosial pada paket ini adalah **simulasi lokal yang aman untuk demo**. Tombol Google/Facebook/Apple tidak membuka halaman palsu dan tidak meminta password provider. Login email hanya memvalidasi format serta panjang input, sedangkan login HP membuat OTP di browser. Tidak ada password atau token yang disimpan.

Untuk autentikasi produksi, ikuti `SECURITY.md`. Jangan memasukkan client secret, password, access token, atau kredensial sungguhan ke file front-end.

## Fungsi yang bisa dicoba

- Tekan `Ctrl + K` untuk membuka pencarian.
- Tandai materi atau checklist jalur belajar; progress tersimpan di browser.
- Isi form Studio Katalog; preview berubah realtime.
- Upload JPG/PNG/WebP maksimal 5 MB; gambar hanya diproses di browser.
- Simpan draft katalog lokal.
- Salin link pratinjau, buka pesan WhatsApp, atau unduh kartu produk HTML.
- Gunakan tombol profil untuk melihat status sesi lokal dan mengakhiri sesi.

## Struktur

```text
project-wds-loka-naik/
├── assets/
│   ├── css/styles.css
│   ├── images/ (aset pendukung, tidak ditampilkan sebagai foto profil)
│   └── js/app.js
├── scripts/smoke-test.mjs
├── index.html
├── login.html
├── search.html
├── learn.html
├── path.html
├── studio.html
├── stories.html
├── brand.html
├── 404.html
├── README.md
└── SECURITY.md
```
