# Desain Halaman — Kursus4 TinyTank (Desktop-first)

## Global Styles
- Layout system: CSS Grid untuk struktur halaman; Flexbox untuk toolbar, navbar, dan kontrol kecil.
- Breakpoints:
  - Desktop (default): 1280px+ (3 kolom utama di halaman kursus)
  - Tablet: 768–1279px (2 kolom; panel instruksi turun ke bawah)
  - Mobile: <768px (stack vertikal; navbar level tetap di atas)
- Design tokens (ringkas):
  - Background: #0B1220
  - Surface/card: #0F1A2B
  - Text primary: #E6EEF8, secondary: #A7B6CC
  - Accent/primary button: #3B82F6 (hover: #2563EB)
  - Success: #22C55E, Danger: #EF4444, Warning: #F59E0B
  - Font: system-ui, skala 12/14/16/20/24
  - Button: radius 10px, height 40px, fokus outline 2px accent
  - Link: underline on hover; disabled state opacity 50%

---

## Page 1 — Daftar Kursus
### Meta Information
- Title: "Courses — TinyTank"
- Description: "Pilih kursus dan lanjutkan progres TinyTank."
- Open Graph: title sama, description sama, type "website"

### Page Structure
- Pola: halaman daftar + kartu kursus (stacked sections)
- Container: max-width 1120px; margin auto; padding 24px

### Sections & Components
1. Header
   - Judul halaman “Courses” + subteks singkat.
2. Course Card: "Kursus4 — TinyTank"
   - Elemen: judul, ringkasan (15 level), daftar blok tersedia (maju/kiri/kanan/tembak), chip “Progress: Lv X/15”.
   - CTA:
     - Tombol utama “Lanjutkan” (mengarah ke level yang diizinkan).
     - Tombol sekunder “Mulai dari awal” (hanya jika belum ada progres atau untuk reset eksplisit).
3. Progres lokal
   - Menampilkan “Level terbuka saat ini: N” dan “Terakhir selesai: M”.

### Interactions
- Saat klik “Lanjutkan”, navigasi ke `/course/4?lv=<levelTerbuka>`.

---

## Page 2 — Halaman Kursus TinyTank
### Meta Information
- Title: "Kursus4 TinyTank — Level {lv}"
- Description: "Selesaikan level dengan menyusun blok gerak dan tembak."
- Open Graph: title dinamis sesuai level, type "website"

### Page Structure (Desktop)
- Grid utama 3 kolom:
  1) Kiri: Editor Blok
  2) Tengah: Area Game/Canvas
  3) Kanan: Instruksi + Status
- Navbar level selalu di bagian paling atas (sticky).
- Padding 16–24px; gap grid 16px.

### Sections & Components
1. Top Navbar Level (sticky)
   - Konten: tombol Level 1–15 (pill buttons).
   - State:
     - Active (highlight)
     - Completed (ikon cek + warna success)
     - Locked (disabled)
   - Aturan anti-skip:
     - Hanya level <= levelTerbuka yang clickable.
     - Jika query `lv` melebihi levelTerbuka, tampilkan toast “Level terkunci” lalu redirect ke levelTerbuka.

2. Panel Kiri — Editor Blok
   - Toolbox blok (draggable/click-to-add): Maju, Kiri, Kanan, Tembak.
   - Workspace urutan blok:
     - Menambah, menghapus, reorder.
     - Tombol: “Reset Blok”, “Hapus Semua”.
   - Validasi ringan:
     - Maksimum panjang program (opsional) untuk menjaga performa.

3. Panel Tengah — Area Game
   - Canvas/Board dengan grid sederhana:
     - Render tembok dan monster.
     - Tank dengan arah hadap.
   - Kontrol eksekusi (di atas/bawah canvas):
     - “Jalankan”, “Hentikan”, “Reset Level”.
   - Prinsip aman & non-blocking:
     - Jalankan langkah per langkah (tick) agar UI tetap responsif.

4. Panel Kanan — Instruksi & Status
   - Kartu “Goal”: “Habiskan semua monster”.
   - Indikator real-time: “Monster tersisa: X”.
   - Hint singkat cara menyelesaikan level (tanpa spoiler penuh).
   - Log kecil (opsional): aksi terakhir (maju/kiri/kanan/tembak).

5. Modal/Toast Feedback
   - Saat level selesai: modal “Level Selesai” + tombol “Lanjut ke Level {lv+1}” (jika ada) dan “Ulangi”.
   - Saat tindakan tidak valid (mis. nabrak tembok): toast singkat.

### Data & Constraints (yang harus tercermin di UI)
- 15 level didefinisikan dalam 1 file data level.
- Setiap level punya goal jelas (monster habis) dan jalur penyelesaian yang wajar.
- Level berisi tembok & monster, dan monster tidak terkurung saat awal level.
- Progres:
  - Disimpan di local storage setiap level selesai.
  - Update ke Progress API dilakukan di background (tanpa mengganggu interaksi); bila gagal, tampilkan indikator kecil “Sync tertunda” tanpa memblok.
- Anti-skip:
  - Level tidak bisa dilompati; navbar menonaktifkan level terkunci; query `lv` divalidasi dan di-redirect bila perlu.

### Responsive behavior
- Tablet: grid jadi 2 kolom (Editor + Game), panel Instruksi di bawah.
- Mobile: stack vertikal; navbar level tetap sticky; tombol eksekusi selalu terlihat (sticky bottom bar jika perlu).