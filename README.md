# Ghost Checker v2.5 — The Architect Edition

**Ghost Checker** adalah alat analisis privasi lokal yang dirancang khusus untuk mendeteksi akun Instagram yang tidak mengikuti Anda kembali (Unfollowers) tanpa memerlukan login. Dikembangkan dengan prinsip **Privacy-First**, aplikasi ini memastikan 100% keamanan data pengguna karena seluruh proses perbandingan dilakukan di memori browser (Client-side), sehingga tidak ada risiko akun terkena *checkpoint* atau *ban* oleh Meta.

---

## 💎 Fitur Utama (Core Features)

- **Universal Discovery Engine v3.2**: Algoritma rekursif cerdas yang mampu mendeteksi username di berbagai skema JSON Instagram (2024-2025).
- **Liquid-Glass UI (V5.0)**: Estetika desain modern dengan transparansi tinggi, Gaussian blur 80px, dan sistem grid 8px yang harmonis.
- **Zero-Login Policy**: Tidak membutuhkan username atau password Instagram. Keamanan akun 100% terjamin.
- **Fluid Responsive Architecture**: Tampilan sempurna dan ergonomis di perangkat mobile (iPhone/Android), tablet, hingga desktop 4K.
- **Instant Result Utility**: Fitur pencarian real-time dan mekanisme "One-Tap Copy" untuk kemudahan manajemen akun di aplikasi Instagram.

---

## 🛠️ Stack Teknologi (Tech Stack)

- **Framework**: Next.js 16 (Turbopack Enabled)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Modern CSS (Vanilla) with Soft-Grid System
- **Processing**: Client-side JSON Stream API & Recursive Crawling Algorithm

---

## 📖 Panduan Penggunaan (How to Use)

1. **Persiapkan Data**:
   - Buka Instagram Meta Accounts Center.
   - Pilih "Download your information" > "Some of your information".
   - Centang hanya **Followers and following**.
   - **PENTING**: Pilih Format **JSON** dan Date Range **All Time**.
2. **Ekstrak File**: Setelah menerima email dari Meta, unduh dan ekstrak file ZIP. Cari folder `connections/followers_and_following`.
3. **Analisis**:
   - Buka [Ghost Checker Live](https://ig-checker-mirsydfchrynto.vercel.app).
   - Unggah file `following.json` dan `followers_1.json`.
   - Sistem akan menampilkan daftar akun yang tidak mengikuti Anda kembali secara instan.

---

## 🛡️ Jaminan Privasi (Privacy Assurance)

Aplikasi ini beroperasi sepenuhnya di sisi klien. Tidak ada data, file, atau username yang dikirim ke server eksternal. Kami tidak memiliki database, API pihak ketiga, atau sistem pelacakan. Privasi Anda adalah prioritas mutlak kami.

---

## 👨‍💻 Kontribusi & Lisensi

Diciptakan oleh **mirsydfchrynto** (The Architect).
Lisensi: MIT. Bebas digunakan untuk keperluan personal.

---

*Ghost Checker — Designed for the Ghost-free Social Experience.*
