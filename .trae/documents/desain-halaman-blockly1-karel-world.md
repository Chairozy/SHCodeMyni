# Desain Halaman — blockly1 (Karel World)

## Global Styles (desktop-first)
- Layout system: CSS Grid (utama) + Flexbox (kontrol/tombol).
- Breakpoints: Desktop ≥ 1024px (default), Tablet 768–1023px, Mobile < 768px.
- Background: #0B1220 (app shell) / #0F172A (panel), card #111C33.
- Typography: Inter/system; base 14–16px; heading 18/20/24.
- Primary button: bg #2563EB, hover #1D4ED8, text white; Disabled: opacity 0.5.
- Secondary button: bg transparent, border #334155, hover #1F2937.
- Accent/success: #22C55E; warning: #F59E0B; error: #EF4444.
- Focus ring: 2px #60A5FA.

## Page: Halaman Kursus blockly1 (Karel World)

### Meta Information
- Title: "blockly1 — Karel World"
- Description: "Course Blockly 15 level Karel World dengan Run/Reset, Speed x1/x2, dan progres tersimpan."
- Open Graph: og:title = Title, og:description = Description, og:type = website.

### Page Structure
- App shell: header (navbar level) + main (workspace).
- Main (desktop): grid 2 kolom.
  - Kolom kiri (flex-grow): area editor Blockly yang diposisikan “di tengah” (container dengan max-width besar + auto margin).
  - Kolom kanan (fixed 360–420px): panel tantangan + program + kontrol.

### Sections & Components

#### 1) Header: Navbar Level (Top)
- Posisi: sticky top, tinggi ~56px, background #0B1220, border-bottom #1F2A44.
- Konten:
  - Label course: "blockly1 (Karel World)".
  - Level switcher: tombol/segmented untuk Level 1–15.
- Aturan interaksi:
  - Anti-skip: level di atas "level yang terbuka" tampil disabled + tooltip singkat (mis. "Selesaikan level sebelumnya dulu").
  - Mengubah level hanya boleh ke: level yang sudah selesai, atau level aktif, atau level berikutnya yang baru terbuka.
  - Saat level berubah, URL query `lv` ikut di-update.

#### 2) Main Left: Blockly Workspace (Center)
- Container: grid area kiri, dengan padding 16–24.
- Workspace:
  - Canvas Blockly memenuhi tinggi viewport tersisa (min-height: calc(100vh - header)).
  - Toolbox menyesuaikan level aktif.
- State:
  - Simpan workspace per level (mis. XML) agar tidak hilang ketika refresh / pindah level.

#### 3) Main Right: Panel Tantangan + Program + Kontrol
- Panel: card vertikal, sticky dalam viewport (opsional), scroll internal.
- Bagian:
  1. "Tantangan":
     - Judul level + goal (teks singkat, jelas).
     - Checklist status (mis. "Goal tercapai" / "Belum").
  2. "Program":
     - Menampilkan ringkasan program yang dihasilkan dari blok (mis. daftar instruksi/steps).
  3. "Kontrol":
     - Tombol: **Run**, **Reset**.
     - Speed toggle: **x1 / x2**.
- Aturan interaksi:
  - Run:
    - Disabled saat sedang running.
    - Menjalankan eksekusi secara asynchronous (non-blocking) agar UI tetap responsif.
  - Reset:
    - Menghentikan eksekusi yang sedang berjalan + mengembalikan world/state level.
  - Speed:
    - Mengubah delay/kecepatan animasi step saat running.

#### 4) Level Completion Feedback
- Saat goal sukses:
  - Tampilkan status sukses di panel (badge hijau).
  - Unlock level berikutnya (navbar).
  - Simpan progres ke localStorage.
  - Kirim update progres ke Progress API di background (tanpa spinner blocking; boleh toast kecil "tersimpan").

### Responsive Behavior
- Tablet: kolom kanan diperkecil; panel bisa menjadi drawer kanan.
- Mobile: layout stack (navbar tetap di atas), Blockly di atas, panel tantangan+program+kontrol di bawah (accordion untuk hemat ruang).

### Persistence & Deep-linking
- On load:
  - Baca `localStorage` untuk menentukan `maxUnlockedLevel`.
  - Baca query `lv`; jika `lv` > `maxUnlockedLevel` maka redirect ke `maxUnlockedLevel`.
- On completion:
  - Update `localStorage` lalu trigger sync background (retry ringan, tidak memblok UI).