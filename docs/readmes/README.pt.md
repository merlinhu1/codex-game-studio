# Codex Game Studio

**Transforme uma sessão Codex em um estúdio de jogos estruturado e local-first.**

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

Codex Game Studio é uma CLI TypeScript. Ela cria para projetos de jogo um workspace pronto para Codex e mantém prompts de papéis, prompts de workflows, arquivos do projeto, estado das tarefas e validação em arquivos comuns revisáveis no Git.

Não é uma engine de jogo nem um gerenciador de projetos hospedado. O objetivo é dar ao Codex um contrato de trabalho mais claro, mantendo decisões criativas e revisão final com humanos.

## Início rápido

Você precisa do Node.js 24 ou mais recente. `run <role>` exige a CLI do Codex.

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

Antes de executar o Codex de verdade, você pode inspecionar o prompt do papel:

```sh
./codex-game-studio run producer \
  "Create the initial market overview." --print-prompt
```

Os comandos detalhados estão no [User Guide](../user-guide.md) em inglês.

## Por que existe

Um chat de codificação com IA vazio é flexível, mas desenvolvimento de jogos precisa de uma estrutura de estúdio repetível:

- Produção precisa de marcos, handoffs e checks de lançamento.
- Design precisa de GDDs, especificações de sistemas, jornadas do jogador e ciclos de ajuste.
- Engenharia precisa de prompts de implementação bem delimitados e gates de validação.
- Arte, QA, áudio, localização e live ops também precisam de contexto próprio.
- Revisores precisam de arquivos verificáveis no Git, não decisões perdidas no histórico do chat.

Codex Game Studio transforma essa estrutura em artefatos locais que o Codex pode ler e humanos podem revisar.

## O que você recebe

| Capacidade | Significado |
| --- | --- |
| Scaffolding local de projeto | Cria um workspace determinístico de jogo na raiz do repositório atual. |
| Papéis de estúdio nativos do Codex | Fornece prompts focados para produção, design, engenharia, arte, QA, localização e release. |
| Prompts de workflow | Oferece prompts reutilizáveis para mercado, análise, specs, handoffs, ship checks e revisão de UI. |
| Camada de engine | Adiciona contexto de Godot, Unity ou Unreal sem transformar o projeto em um wrapper de engine. |
| Estado de tarefas em arquivos | Armazena tarefas, locks e metadados de execução em `.codex/**`. |
| Inspeção antes da execução | Dry-run e impressão de prompt permitem revisar antes de deixar o Codex agir. |
| Validação estrita | Detecta arquivos gerados obsoletos, metadados inválidos, assets ausentes e deriva para recursos futuros. |

## Leia mais

| Necessidade | Documento |
| --- | --- |
| Instalação, comandos, workflows e validação | [User Guide](../user-guide.md) |
| Cenários de uso | [Examples](../examples/README.md) |
| Mapa completo da documentação | [Docs Index](../README.md) |

## Estado do projeto

Codex Game Studio atualmente suporta scaffolding determinístico, execução de papéis Codex, renderização de prompts de workflow, orquestração de tarefas em arquivos e validação de repositório/projeto.

Comandos planner ou `next`, telemetria, orquestração hospedada, paralelismo ilimitado, propriedade forçada de saída e geração de `CODEX.md` / `project_orchestrator.md` estão fora do escopo atual.

## Licença

Codex Game Studio usa MIT License. Veja [`LICENSE`](../../LICENSE).
