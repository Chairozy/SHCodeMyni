# Desain Halaman (Desktop-first) — LMS Statik GitHub Pages

## Global Styles (Design Tokens)
- Kanvas: `background: #0B1220` (navy gelap) atau `#0F172A`; surface kartu: `#111827`; border: `#243244`
- Warna utama (accent): `#3B82F6` (primary), hover `#2563EB`; sukses `#22C55E`; warning `#F59E0B`; error `#EF4444`
- Tipografi: Inter / system-ui
  - H1 28–32px semibold, H2 20–24px semibold, body 14–16px normal
- Komponen tombol:
  - Primary: bg primary, text putih, hover lebih gelap, disabled 60% opacity
  - Secondary: bg transparan, border 1px, hover surface lebih terang
- Link: underline on hover, warna `#93C5FD`
- Spasi: basis 8px (8/16/24/32)
- Layout grid desktop: max-width 1120–1200px, centered, padding 24px
- Responsive: desktop-first; untuk <=768px navbar jadi stacked, tabel jadi card list, sidebar (jika ada) collapse

## Meta Information (Default)
- Title template: `CodeMyni — {Nama Halaman}`
- Description: `CodeMyni: LMS statik untuk 1 kursus dengan sequence materi & kuis.`
- Open Graph:
  - `og:title`, `og:description` mengikuti title/description
  - `og:type=website`

---

## 1) Halaman: Login via URL (Gate) — `/`

### Layout
- Single column, center-aligned (Flexbox) dengan kartu di tengah layar.
- Lebar kartu 520–600px.

### Page Structure
1. Header kecil (logo/nama produk)
2. Card “Akses”
3. Panel “Contoh URL”

### Sections & Components
- Card “Akses”
  - Judul: “Masuk via Link”
  - Status chip: “Membaca parameter URL…” → “Valid” / “Tidak valid”
  - Ringkasan hasil parsing:
    - Role (admin/teacher/student)
    - userId (tampil jika student)
  - CTA:
    - Tombol “Lanjut ke Kursus” (enabled hanya jika valid)
  - Error state:
    - Pesan ringkas + daftar parameter yang hilang
- Panel “Contoh URL” (read-only)
  - Menampilkan 3 contoh link (admin/teacher/student)
  - Tombol “Copy” untuk tiap contoh

---

## 2) Halaman: Beranda / Kursus — `/course`

### Layout
- Dua kolom (CSS Grid):
  - Kolom kiri (main) 8/12: ringkasan kursus + sequence
  - Kolom kanan (side) 4/12: kartu progress + info role

### Page Structure
1. Top Navbar
2. Course hero (judul + deskripsi)
3. Sequence list
4. Sidebar cards

### Sections & Components
- Top Navbar
  - Kiri: nama produk + breadcrumb “Course”
  - Kanan: role badge + userId + tombol “Ganti Link” (kembali ke Gate)
- Course hero
  - Judul kursus
  - Deskripsi singkat
  - CTA utama: “Lanjutkan” (masuk ke item sequence aktif)
- Sequence list (card list)
  - Setiap item: ikon (materi/kuis), judul, status badge
  - Status:
    - Locked: disabled, tooltip “Selesaikan langkah sebelumnya”
    - Available: klik menuju lesson/quiz
    - Completed: ceklis + timestamp (opsional)
- Sidebar
  - Card Progress:
    - “Langkah saat ini: {n}/{total}”
    - Progress bar
  - Card Info:
    - “Data sumber: JSON (mock Airtable)”
    - “Penyimpanan: localStorage”

---

## 3) Halaman: Modul (Materi) — `/lesson/:lessonId`

### Layout
- Tiga area (hybrid Grid + Flex):
  - Header sticky (navbar + progress mini)
  - Main content (markdown) max-width 820px
  - Footer nav (prev/next)

### Page Structure
1. Navbar (sticky)
2. Konten materi
3. Footer actions

### Sections & Components
- Navbar sticky
  - Tombol “← Kembali” ke /course
  - Breadcrumb: Course > {Lesson Title}
  - Mini step indicator: “Step {n}/{total}”
- Konten materi
  - Render markdown (heading, list, code block) dengan styling terbaca
  - Callout info (jika ada link eksternal)
- Footer actions (sticky bottom on desktop optional)
  - Secondary: “Sebelumnya” (disabled jika first)
  - Primary: “Tandai Selesai & Lanjut”
  - State:
    - Saat klik: simpan progress → toast “Tersimpan” → redirect ke step berikutnya

---

## 4) Halaman: Kuis — `/quiz/:quizId`

### Layout
- Dua kolom (Grid):
  - Main 8/12: area soal
  - Side 4/12: panel navigasi soal + status

### Page Structure
1. Navbar (sticky)
2. Panel soal aktif
3. Sidebar status
4. Modal/section hasil

### Sections & Components
- Panel soal aktif
  - Judul kuis + step indicator
  - Kartu soal:
    - Prompt
    - Opsi jawaban (radio)
    - Tombol “Submit Jawaban”
  - Setelah submit:
    - Tampilkan benar/salah
    - Tampilkan explanation (jika ada)
    - Tombol “Soal berikutnya” / “Lihat hasil”
- Sidebar
  - Daftar nomor soal (1..n) dengan status: belum dijawab / benar / salah
  - Skor sementara
- Hasil kuis
  - Ringkasan skor total
  - CTA “Selesai & Kembali ke Kursus” atau “Lanjut ke Step Berikutnya”
  - Penyimpanan: tulis `progress.completed.quizzes[quizId]` ke localStorage

---

## 5) Halaman: Dashboard Admin/Guru — `/admin`

### Layout
- Dashboard layout (Grid):
  - Sidebar kiri 240px (menu)
  - Main area (konten)

### Page Structure
1. Top bar (judul + role)
2. Sidebar menu
3. Tab konten: Data, Sequence, Progress

### Sections & Components
- Sidebar menu
  - Item: “Data JSON”, “Sequence Kursus”, “Progress Murid”
- Tab: Data JSON
  - Tabel read-only:
    - Users
    - Course
    - Lessons
    - Quizzes
  - Fitur minimum: search box (filter lokal) dan copy JSON
- Tab: Sequence Kursus
  - List sequence (drag/drop atau tombol ↑ ↓)
  - Validasi sederhana:
    - Minimal 1 lesson dan 1 quiz
    - Tidak boleh duplicate id
  - Output panel “Export JSON”
    - Tombol “Copy JSON”
- Tab: Progress Murid
  - Table/卡片:
    - userId, langkah terakhir, skor kuis, last updated
  - Filter input: userId

---

## Catatan Interaksi & State
- Sumber kebenaran sequence: `course.json` (static)
- State runtime:
  - Session: dari query → disimpan di memori; fallback localStorage untuk refresh
  - Progress: localStorage per userId
- Empty states:
  - Jika tidak ada progress: tampilkan “Mulai dari awal”
  - Jika token invalid: hanya Gate yang bisa diakses
