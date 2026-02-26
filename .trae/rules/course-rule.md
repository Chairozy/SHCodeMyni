1. Any course content, like levels all in 1 file.
2. Each changing level keep to clean code.
3. Each level has a clear goal and a clear path to achieve it.
4. Course is lazy load, mean only load when user enter the course page.
5. Student course progress is saved in local storage, each completed level will update progress api, in background.
6. Keep course when executing code or running code is safe, mean not block user interaction.
7. Course interface design is have navbar top for change level.
8. Course level can't be skipped, mean user must complete current level before move to next level.
9. Course dengan awalan id "blockly" adalah course yang menggunakan blockly sebagai editor kode:
  - Blockly kode editor di kiri, selalu munculkan block tanpa kategori.
  - Tantangan dan program ada di sebelah kanan, dengan sediakan 2 tombol "Run", "Reset", dan "Speed x1/x2".
  - Kalau win maka muncul tombol lanjutkan.
