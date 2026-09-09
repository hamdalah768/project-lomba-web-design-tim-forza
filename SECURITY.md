# Catatan Keamanan

## Status paket ini

Paket ini adalah front-end statis untuk demo dan pembelajaran. Ia tidak menyediakan backend, database, SMS gateway, OAuth provider, session cookie, atau kontrol akses produksi. Karena itu, status “login” di browser hanya boleh diperlakukan sebagai sesi demo.

## Yang sudah diterapkan

- Tidak ada kredensial provider sosial yang dikumpulkan oleh tombol demo.
- Tidak ada secret, password, atau access token yang ditanam di source code.
- Redirect setelah login memakai daftar halaman lokal yang diizinkan; parameter `next` tidak boleh menjadi URL eksternal.
- Input katalog diberi batas panjang, tipe file, dan batas ukuran 5 MB di browser.
- Teks yang dipakai pada export kartu HTML di-escape sebelum dimasukkan ke dokumen hasil unduhan.
- Draft dan progress disimpan hanya di `localStorage`; sesi demo memakai `sessionStorage`.
- UI menampilkan peringatan bahwa OTP yang tampil adalah simulasi lokal.

## Wajib sebelum produksi

1. Gunakan HTTPS dan header keamanan seperti CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, dan `Permissions-Policy`.
2. Hubungkan Google/Facebook/Apple melalui SDK/provider resmi dengan OAuth 2.0 + PKCE. Tukar authorization code di backend; jangan menaruh client secret di browser.
3. Validasi ulang semua input di server, termasuk file upload. Deteksi MIME dan magic bytes, batasi resolusi/ukuran, rename file, dan simpan di storage terisolasi.
4. Gunakan session cookie `HttpOnly`, `Secure`, dan `SameSite=Lax`/`Strict`. Tambahkan CSRF protection untuk aksi yang mengubah data.
5. Tambahkan rate limit, lockout bertahap, audit log tanpa token/password, dan monitoring untuk login/OTP.
6. Jangan menyimpan password mentah. Jika password lokal benar-benar dibutuhkan, hash dengan Argon2id atau bcrypt di server dan sediakan reset account yang aman.
7. Kirim OTP melalui SMS provider resmi dan jangan pernah menampilkan OTP di UI produksi.
8. Pindahkan draft/progress ke database dengan izin akses per pengguna, retention policy, dan penghapusan data yang terdokumentasi.
9. Tinjau link WhatsApp, kebijakan privasi, consent, dan kebutuhan hukum sebelum diluncurkan.

## Batasan yang sengaja dipertahankan

Fitur demo tidak dimaksudkan untuk melindungi data bisnis sensitif. Jangan memasukkan password nyata, token, nomor identitas, data pembayaran, atau data pelanggan ke versi ZIP ini.
