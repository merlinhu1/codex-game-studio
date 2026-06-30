# Codex Game Studio

**Codex セッションを、構造化されたローカル優先のゲームスタジオに変える CLI。**

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md)

Codex Game Studio は TypeScript 製の CLI です。ゲームプロジェクト用に、Codex が使いやすいワークスペースを作成します。ロールプロンプト、ワークフロープロンプト、プロジェクトファイル、タスク状態、検証情報は、Git でレビューできる通常のファイルとして保存されます。

これはゲームエンジンでも、ホステッドなプロジェクト管理サービスでもありません。Codex に明確な作業契約を与えつつ、創造的な判断とレビューは人間側に残します。

## クイックスタート

Node.js 24 以上が必要です。`run <role>` には Codex CLI が必要です。

```sh
git clone git@github.com:merlinhu1/codex-game-studio.git
cd codex-game-studio
npm install
npm run build

./codex-game-studio init --name "Signal Cartographer" --engine godot --mode prototype --non-interactive \
  --concept "A compact puzzle game about routing trains through haunted switchyards"

./codex-game-studio status --project projects/signal-cartographer
./codex-game-studio validate --project projects/signal-cartographer
```

Codex を起動する前に、ロールプロンプトを確認できます：

```sh
./codex-game-studio run producer --project projects/signal-cartographer \
  "Create the initial market overview." --print-prompt
```

詳しいコマンド説明は英語の [User Guide](../user-guide.md) を参照してください。

## なぜ必要か

空の AI コーディングチャットは柔軟ですが、ゲーム開発には反復可能なスタジオ構造が必要です：

- プロデューサーにはマイルストーン、引き継ぎ、リリースチェックが必要です。
- デザイナーには GDD、システム仕様、プレイヤージャーニー、チューニングループが必要です。
- エンジニアには境界の明確な実装プロンプトと検証ゲートが必要です。
- アート、QA、オーディオ、ローカライズ、ライブ運用にはそれぞれ専用の文脈が必要です。
- レビュー担当者には、チャット履歴ではなく Git で確認できるファイルが必要です。

Codex Game Studio は、その構造をローカルなプロジェクト成果物に変換します。

## 得られるもの

| 機能 | 意味 |
| --- | --- |
| ローカルプロジェクト生成 | 現在のリポジトリルートに決定的なゲームワークスペースを作成します。 |
| Codex ネイティブなスタジオロール | 制作、デザイン、エンジニアリング、アート、QA、ローカライズ、リリース用のロールプロンプトを生成します。 |
| ワークフロープロンプト | 市場調査、分析、仕様、引き継ぎ、出荷確認、UI レビューなどの再利用可能なプロンプトを提供します。 |
| エンジンオーバーレイ | Godot、Unity、Unreal の文脈を追加しますが、エンジンラッパーにはなりません。 |
| ファイルベースのタスク状態 | `.codex/**` にタスク、ロック、実行メタデータを保存します。 |
| 実行前の確認 | dry-run とプロンプト表示で、Codex 実行前に内容を確認できます。 |
| 厳格な検証 | 古い生成ファイル、不正なメタデータ、欠落アセット、未実装サーフェスの混入を検出します。 |

## 詳しく読む

| 目的 | ドキュメント |
| --- | --- |
| インストール、コマンド、ワークフロー、検証 | [User Guide](../user-guide.md) |
| 利用シナリオ | [Examples](../examples/README.md) |
| ドキュメント全体 | [Docs Index](../README.md) |

## プロジェクト状態

Codex Game Studio は現在、決定的なプロジェクト生成、Codex ロール実行、ワークフロープロンプト生成、ファイルベースのタスク編成、リポジトリ/プロジェクト検証をサポートしています。

planner または `next` コマンド、テレメトリ、ホステッド編成、無制限の並列処理、強制的な出力所有権、`CODEX.md` / `project_orchestrator.md` の生成は現在の製品境界外です。

## ライセンス

Codex Game Studio は MIT License で公開されています。詳しくは [`LICENSE`](../../LICENSE) を参照してください。
