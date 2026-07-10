# Codex Game Studio

**Ubah sesi Codex menjadi studio game yang terstruktur dan local-first.**

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

Codex Game Studio adalah CLI TypeScript. Alat ini membuat workspace yang siap dipakai Codex untuk proyek game, lalu menyimpan prompt peran, prompt workflow, file proyek, status tugas, dan validasi sebagai file biasa yang bisa ditinjau di Git.

Ini bukan game engine dan bukan project manager hosted. Tujuannya memberi Codex kontrak kerja yang lebih jelas, sementara keputusan kreatif dan review akhir tetap dipegang manusia.

## Mulai cepat

Butuh Node.js 24 atau lebih baru. `run <role>` membutuhkan Codex CLI.

```sh
git clone git@github.com:merlinhu1/codex-game-studio.git signal-cartographer
cd signal-cartographer
npm install
npm run build

./codex-game-studio init --name "Signal Cartographer" --engine godot --mode prototype --non-interactive \
  --concept "A compact puzzle game about routing trains through haunted switchyards"

./codex-game-studio status
./codex-game-studio validate
```

Sebelum menjalankan Codex sungguhan, Anda bisa memeriksa prompt peran:

```sh
./codex-game-studio run producer \
  "Create the initial market overview." --print-prompt
```

Perintah rinci tersedia dalam [User Guide](../user-guide.md) berbahasa Inggris.

## Mengapa ini ada

Chat AI coding yang kosong memang fleksibel, tetapi pengembangan game membutuhkan struktur studio yang dapat diulang:

- Producer membutuhkan milestone, handoff, dan pemeriksaan rilis.
- Designer membutuhkan GDD, spesifikasi sistem, player journey, dan loop tuning.
- Engineer membutuhkan prompt implementasi yang berbatas jelas dan gate validasi.
- Art, QA, audio, lokalisasi, dan live ops juga membutuhkan konteks masing-masing.
- Reviewer membutuhkan file yang bisa diperiksa di Git, bukan keputusan yang hilang di riwayat chat.

Codex Game Studio mengubah struktur itu menjadi artefak proyek lokal yang dapat dibaca Codex dan ditinjau manusia.

## Yang Anda dapatkan

| Kemampuan | Artinya |
| --- | --- |
| Scaffolding proyek lokal | Membuat workspace game deterministik di root repository saat ini. |
| Peran studio native untuk Codex | Menyediakan prompt terfokus untuk produksi, desain, engineering, art, QA, lokalisasi, dan rilis. |
| Prompt workflow | Menyediakan prompt pakai ulang untuk market, analysis, spec, handoff, ship check, dan UI review. |
| Lapisan engine | Menambahkan konteks Godot, Unity, atau Unreal tanpa mengubah proyek menjadi wrapper engine. |
| Status tugas berbasis file | Menyimpan task, lock, dan metadata run di `.codex/**`. |
| Inspeksi sebelum eksekusi | Dry-run dan cetak prompt memungkinkan pemeriksaan sebelum Codex bertindak. |
| Validasi ketat | Mendeteksi file generated yang usang, metadata salah, asset hilang, dan drift ke fitur masa depan. |

## Baca lebih lanjut

| Kebutuhan | Dokumen |
| --- | --- |
| Instalasi, perintah, workflow, dan validasi | [User Guide](../user-guide.md) |
| Skenario penggunaan | [Examples](../examples/README.md) |
| Peta dokumentasi lengkap | [Docs Index](../README.md) |

## Status proyek

Codex Game Studio saat ini mendukung scaffolding proyek deterministik, eksekusi peran Codex, rendering prompt workflow, orkestrasi tugas berbasis file, dan validasi repository/proyek.

Perintah planner atau `next`, telemetry, orkestrasi hosted, paralelisme tanpa batas, kepemilikan output paksa, dan pembuatan `CODEX.md` / `project_orchestrator.md` berada di luar batas produk saat ini.

## Lisensi

Codex Game Studio menggunakan MIT License. Lihat [`LICENSE`](../../LICENSE).
