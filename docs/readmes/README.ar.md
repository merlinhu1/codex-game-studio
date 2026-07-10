# Codex Game Studio

**حوّل جلسة Codex إلى استوديو ألعاب منظّم يعمل محلياً أولاً.**

[🇺🇸 English](../../README.md) | [🇨🇳 简体中文](README.zh.md) | [🇯🇵 日本語](README.ja.md) | [🇰🇷 한국어](README.ko.md) | [🇩🇪 Deutsch](README.de.md) | [🇫🇷 Français](README.fr.md) | [🇪🇸 Español](README.es.md) | [🇧🇷 Português](README.pt.md) | [🇷🇺 Русский](README.ru.md) | [🇸🇦 العربية](README.ar.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇹🇷 Türkçe](README.tr.md) | [🇻🇳 Tiếng Việt](README.vi.md) | [🇮🇩 Bahasa Indonesia](README.id.md) | [🇬🇷 Ελληνικά](README.el.md)

Codex Game Studio هو واجهة أوامر مبنية بـ TypeScript. ينشئ مساحة عمل مناسبة لـ Codex في مشاريع الألعاب، ويحفظ مطالبات الأدوار، ومطالبات سير العمل، وملفات المشروع، وحالة المهام، ومعلومات التحقق في ملفات عادية قابلة للمراجعة عبر Git.

ليس محرك ألعاب ولا مدير مشاريع مستضافاً. هدفه أن يمنح Codex عقد عمل أوضح، مع إبقاء القرارات الإبداعية والمراجعة النهائية بيد البشر.

## البدء السريع

تحتاج إلى Node.js 24 أو أحدث. الأمر `run <role>` يحتاج إلى Codex CLI.

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

قبل تشغيل Codex فعلياً، يمكنك فحص مطالبة الدور:

```sh
./codex-game-studio run producer \
  "Create the initial market overview." --print-prompt
```

توجد تفاصيل الأوامر في [User Guide](../user-guide.md) باللغة الإنجليزية.

## لماذا يوجد هذا المشروع

محادثة برمجة AI فارغة مرنة، لكن تطوير الألعاب يحتاج إلى بنية استوديو قابلة للتكرار:

- يحتاج المنتجون إلى مراحل، وتسليمات، وفحوصات إصدار.
- يحتاج المصممون إلى GDD ومواصفات أنظمة ورحلة لاعب وحلقات ضبط.
- يحتاج المهندسون إلى مطالبات تنفيذ محددة وحدود تحقق واضحة.
- تحتاج فرق الفن وQA والصوت والتوطين والعمليات الحية إلى سياقها الخاص أيضاً.
- يحتاج المراجعون إلى ملفات يمكن فحصها في Git، لا قرارات تضيع في سجل المحادثة.

يحوّل Codex Game Studio هذه البنية إلى مخرجات مشروع محلية يستطيع Codex قراءتها ويستطيع البشر مراجعتها.

## ما الذي تحصل عليه

| القدرة | المعنى |
| --- | --- |
| تهيئة مشروع محلية | ينشئ مساحة عمل ألعاب حتمية في جذر المستودع الحالي. |
| أدوار استوديو أصلية لـ Codex | يوفر مطالبات مركزة للإنتاج والتصميم والهندسة والفن وQA والتوطين والإصدار. |
| مطالبات سير العمل | يوفر مطالبات قابلة لإعادة الاستخدام للسوق والتحليل والمواصفات والتسليم وفحوصات الإطلاق ومراجعة الواجهة. |
| طبقة محرك | يضيف سياق Godot أو Unity أو Unreal دون تحويل المشروع إلى غلاف لمحرك ألعاب. |
| حالة مهام في ملفات | يحفظ المهام والأقفال وبيانات التشغيل في `.codex/**`. |
| فحص قبل التنفيذ | تساعد dry-run وطباعة المطالبة على المراجعة قبل السماح لـ Codex بالعمل. |
| تحقق صارم | يكشف الملفات المولدة القديمة، والبيانات الوصفية الخاطئة، والأصول المفقودة، والانحراف نحو ميزات مستقبلية. |

## اقرأ المزيد

| الحاجة | الوثيقة |
| --- | --- |
| التثبيت والأوامر وسير العمل والتحقق | [User Guide](../user-guide.md) |
| سيناريوهات الاستخدام | [Examples](../examples/README.md) |
| خريطة الوثائق الكاملة | [Docs Index](../README.md) |

## حالة المشروع

يدعم Codex Game Studio حالياً تهيئة مشروع حتمية، وتشغيل أدوار Codex، وعرض مطالبات سير العمل، وتنظيم المهام عبر الملفات، والتحقق من المستودع/المشروع.

أوامر planner أو `next`، والقياسات، والتنظيم المستضاف، والتوازي غير المحدود، وفرض ملكية المخرجات، وتوليد `CODEX.md` / `project_orchestrator.md` خارج حدود المنتج الحالية.

## الرخصة

يستخدم Codex Game Studio رخصة MIT License. راجع [`LICENSE`](../../LICENSE).
