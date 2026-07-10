# Codex Game Studio

**Biến một phiên Codex thành studio game có cấu trúc, ưu tiên chạy cục bộ.**

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

Codex Game Studio là CLI TypeScript. Nó tạo workspace sẵn sàng cho Codex trong dự án game và lưu role prompt, workflow prompt, file dự án, trạng thái tác vụ và thông tin kiểm chứng trong các file bình thường có thể review bằng Git.

Nó không phải game engine hay trình quản lý dự án hosted. Mục tiêu là cho Codex một hợp đồng làm việc rõ hơn, trong khi quyết định sáng tạo và review cuối vẫn thuộc về con người.

## Bắt đầu nhanh

Cần Node.js 24 trở lên. `run <role>` cần Codex CLI.

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

Trước khi chạy Codex thật, bạn có thể xem role prompt:

```sh
./codex-game-studio run producer \
  "Create the initial market overview." --print-prompt
```

Lệnh chi tiết nằm trong [User Guide](../user-guide.md) tiếng Anh.

## Vì sao cần nó

Một chat AI coding trống rất linh hoạt, nhưng phát triển game cần cấu trúc studio lặp lại được:

- Producer cần milestone, handoff và kiểm tra release.
- Designer cần GDD, spec hệ thống, player journey và vòng tuning.
- Engineer cần prompt triển khai có ranh giới rõ và cổng xác minh.
- Art, QA, audio, localization và live ops cũng cần ngữ cảnh riêng.
- Reviewer cần file có thể kiểm tra trong Git, không phải quyết định mất trong lịch sử chat.

Codex Game Studio biến cấu trúc đó thành artefact cục bộ mà Codex đọc được và con người review được.

## Bạn nhận được gì

| Khả năng | Ý nghĩa |
| --- | --- |
| Tạo khung dự án cục bộ | Tạo workspace game quyết định trong root repository hiện tại. |
| Vai trò studio native cho Codex | Cung cấp role prompt tập trung cho production, design, engineering, art, QA, localization và release. |
| Workflow prompt | Cung cấp prompt tái sử dụng cho market, analysis, spec, handoff, ship check và UI review. |
| Lớp engine | Thêm ngữ cảnh Godot, Unity hoặc Unreal mà không biến dự án thành engine wrapper. |
| Trạng thái tác vụ bằng file | Lưu task, lock và metadata chạy dưới `.codex/**`. |
| Kiểm tra trước khi chạy | Dry-run và in prompt giúp kiểm tra trước khi để Codex hành động. |
| Xác minh nghiêm ngặt | Phát hiện generated file cũ, metadata sai, thiếu asset và drift sang tính năng tương lai. |

## Đọc thêm

| Nhu cầu | Tài liệu |
| --- | --- |
| Cài đặt, lệnh, workflow và xác minh | [User Guide](../user-guide.md) |
| Kịch bản sử dụng | [Examples](../examples/README.md) |
| Bản đồ tài liệu đầy đủ | [Docs Index](../README.md) |

## Trạng thái dự án

Codex Game Studio hiện hỗ trợ tạo khung dự án quyết định, chạy role Codex, render workflow prompt, điều phối tác vụ bằng file và xác minh repository/dự án.

Lệnh planner hoặc `next`, telemetry, orchestration hosted, song song vô hạn, ép quyền sở hữu output và tạo `CODEX.md` / `project_orchestrator.md` nằm ngoài phạm vi sản phẩm hiện tại.

## Giấy phép

Codex Game Studio dùng MIT License. Xem [`LICENSE`](../../LICENSE).
