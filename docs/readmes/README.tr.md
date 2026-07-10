# Codex Game Studio

**Bir Codex oturumunu yapılandırılmış, yerel öncelikli bir oyun stüdyosuna dönüştürün.**

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

Codex Game Studio bir TypeScript CLI’dır. Oyun projeleri için Codex’e hazır bir çalışma alanı oluşturur; rol promptlarını, workflow promptlarını, proje dosyalarını, görev durumunu ve doğrulama bilgisini Git’te incelenebilir normal dosyalarda tutar.

Bir oyun motoru veya barındırılan proje yöneticisi değildir. Amaç, yaratıcı kararlar ve son inceleme insanlarda kalırken Codex’e daha net bir çalışma sözleşmesi vermektir.

## Hızlı başlangıç

Node.js 24 veya daha yenisi gerekir. `run <role>` için Codex CLI gerekir.

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

Codex’i gerçekten çalıştırmadan önce rol promptunu inceleyebilirsiniz:

```sh
./codex-game-studio run producer \
  "Create the initial market overview." --print-prompt
```

Ayrıntılı komutlar İngilizce [User Guide](../user-guide.md) içinde yer alır.

## Neden var

Boş bir AI coding sohbeti esnektir, ancak oyun geliştirme tekrarlanabilir bir stüdyo yapısı ister:

- Prodüktörler kilometre taşlarına, handofflara ve release kontrollerine ihtiyaç duyar.
- Tasarımcılar GDD, sistem spesifikasyonları, oyuncu yolculukları ve ayar döngüleri ister.
- Mühendisler sınırları net implementasyon promptları ve doğrulama kapıları ister.
- Art, QA, ses, lokalizasyon ve live ops kendi bağlamına ihtiyaç duyar.
- Reviewer’ların sohbet geçmişinde kaybolan kararlar yerine Git’te incelenebilir dosyalara ihtiyacı vardır.

Codex Game Studio bu yapıyı Codex’in okuyabileceği ve insanların inceleyebileceği yerel proje artefaktlarına dönüştürür.

## Ne elde edersiniz

| Yetenek | Anlamı |
| --- | --- |
| Yerel proje iskeleti | Geçerli repository kökünde deterministik bir oyun çalışma alanı oluşturur. |
| Codex-native stüdyo rolleri | Prodüksiyon, tasarım, engineering, art, QA, lokalizasyon ve release için odaklı rol promptları sağlar. |
| Workflow promptları | Pazar, analiz, spec, handoff, ship check ve UI review için yeniden kullanılabilir promptlar sunar. |
| Motor katmanı | Projeyi motor wrapper’ına çevirmeden Godot, Unity veya Unreal bağlamı ekler. |
| Dosya tabanlı görev durumu | Görevleri, kilitleri ve çalışma metadatasını `.codex/**` altında saklar. |
| Çalıştırmadan önce inceleme | Dry-run ve prompt yazdırma, Codex çalışmadan önce kontrol etmeyi sağlar. |
| Sıkı doğrulama | Eski generated dosyaları, hatalı metadata, eksik asset ve gelecekteki özellik driftini yakalar. |

## Devamını oku

| İhtiyaç | Belge |
| --- | --- |
| Kurulum, komutlar, workflowlar ve doğrulama | [User Guide](../user-guide.md) |
| Kullanım senaryoları | [Examples](../examples/README.md) |
| Tam dokümantasyon haritası | [Docs Index](../README.md) |

## Proje durumu

Codex Game Studio şu anda deterministik proje iskeleti, Codex rol yürütme, workflow prompt rendering, dosya tabanlı görev orkestrasyonu ve repository/proje doğrulamasını destekler.

Planner veya `next` komutları, telemetri, barındırılan orkestrasyon, sınırsız paralellik, zorunlu çıktı sahipliği ve `CODEX.md` / `project_orchestrator.md` üretimi mevcut ürün sınırının dışındadır.

## Lisans

Codex Game Studio MIT License kullanır. Bkz. [`LICENSE`](../../LICENSE).
