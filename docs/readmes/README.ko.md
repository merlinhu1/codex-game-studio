# Codex Game Studio

**Codex 세션을 구조화된 로컬 우선 게임 스튜디오로 바꿉니다.**

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

Codex Game Studio는 TypeScript CLI입니다. 게임 프로젝트를 위해 Codex가 바로 사용할 수 있는 워크스페이스를 만들고, 역할 프롬프트, 워크플로 프롬프트, 프로젝트 파일, 작업 상태, 검증 정보를 Git에서 리뷰 가능한 일반 파일로 저장합니다.

이 도구는 게임 엔진도, 호스팅 프로젝트 관리자도 아닙니다. Codex에 더 명확한 작업 계약을 제공하면서 창작 결정과 최종 리뷰는 사람에게 남겨 둡니다.

## 빠른 시작

Node.js 24 이상이 필요합니다. `run <role>`에는 Codex CLI가 필요합니다.

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

Codex를 실행하기 전에 역할 프롬프트를 확인할 수 있습니다.

```sh
./codex-game-studio run producer \
  "Create the initial market overview." --print-prompt
```

자세한 명령 설명은 영어 [User Guide](../user-guide.md)를 참고하세요.

## 왜 필요한가

빈 AI 코딩 채팅은 유연하지만, 게임 개발에는 반복 가능한 스튜디오 구조가 필요합니다.

- 프로듀서는 마일스톤, 핸드오프, 출시 체크가 필요합니다.
- 디자이너는 GDD, 시스템 명세, 플레이어 여정, 튜닝 루프가 필요합니다.
- 엔지니어는 경계가 명확한 구현 프롬프트와 검증 게이트가 필요합니다.
- 아트, QA, 오디오, 로컬라이제이션, 라이브 운영은 각자의 맥락이 필요합니다.
- 리뷰어는 채팅 기록이 아니라 Git에서 확인할 수 있는 파일이 필요합니다.

Codex Game Studio는 이 구조를 Codex가 읽고 사람이 리뷰할 수 있는 로컬 프로젝트 산출물로 바꿉니다.

## 제공하는 것

| 기능 | 의미 |
| --- | --- |
| 로컬 프로젝트 스캐폴딩 | 현재 저장소 루트에 결정적인 게임 워크스페이스를 만듭니다. |
| Codex 네이티브 스튜디오 역할 | 제작, 디자인, 엔지니어링, 아트, QA, 로컬라이제이션, 출시 작업용 역할 프롬프트를 제공합니다. |
| 워크플로 프롬프트 | 시장 리뷰, 분석, 명세, 핸드오프, 출시 체크, UI 리뷰 등 재사용 가능한 프롬프트를 제공합니다. |
| 엔진 오버레이 | Godot, Unity, Unreal 맥락을 추가하지만 엔진 래퍼가 되지는 않습니다. |
| 파일 기반 작업 상태 | `.codex/**` 아래에 작업, 잠금, 실행 메타데이터를 저장합니다. |
| 실행 전 검사 | dry-run과 프롬프트 출력으로 Codex 실행 전 내용을 확인할 수 있습니다. |
| 엄격한 검증 | 오래된 생성 파일, 잘못된 메타데이터, 누락 자산, 미래 기능 표면을 감지합니다. |

## 더 읽기

| 필요 | 문서 |
| --- | --- |
| 설치, 명령, 워크플로, 검증 | [User Guide](../user-guide.md) |
| 사용 시나리오 | [Examples](../examples/README.md) |
| 전체 문서 지도 | [Docs Index](../README.md) |

## 프로젝트 상태

Codex Game Studio는 현재 결정적 프로젝트 스캐폴딩, Codex 역할 실행, 워크플로 프롬프트 렌더링, 파일 기반 작업 오케스트레이션, 저장소/프로젝트 검증을 지원합니다.

planner 또는 `next` 명령, 텔레메트리, 호스팅 오케스트레이션, 무제한 병렬 처리, 강제 출력 소유권, `CODEX.md` / `project_orchestrator.md` 생성은 현재 제품 경계 밖입니다.

## 라이선스

Codex Game Studio는 MIT License로 배포됩니다. [`LICENSE`](../../LICENSE)를 참조하세요.
