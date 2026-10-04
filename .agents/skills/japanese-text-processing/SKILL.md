---
name: japanese-text-processing
description: >-
  Provides guidelines and utilities for processing Japanese text, Kanji, Kana,
  Furigana, romaji, and desktop typography. Use when rendering Japanese content,
  handling IME input, formatting Ruby text, or validating Japanese text strings.
---

# Japanese Text Processing & Typography Skill

## 1. Unicode & Character Ranges

Japanese text encompasses multiple scripts. Never assume standard ASCII behavior.

| Script | Unicode Range | Regex Pattern | Notes |
| :--- | :--- | :--- | :--- |
| **Hiragana** | `U+3040 - U+309F` | `[\u3040-\u309f]` | Native grammatical particles & words |
| **Katakana** | `U+30A0 - U+30FF` | `[\u30a0-\u30ff]` | Loan words, onomatopoeia |
| **Kanji (CJK)**| `U+4E00 - U+9FAF` | `[\u4e00-\u9faf]` | CJK Unified Ideographs |
| **Japanese Punctuation** | `U+3000 - U+303F` | `[\u3000-\u303f]` | `。` (Kuten), `、` (Toten), `「` `」` (Quotes) |
| **Full-width Alphanumeric** | `U+FF01 - U+FF5E` | `[\uff01-\uff5e]` | E.g. `１`, `２`, `Ａ`, `Ｂ` |

---

## 2. IME (Input Method Editor) Event Handling in React

### The "Premature Submit" Gotcha:
When typing Japanese on desktop, learners press **Enter** to convert Kana into Kanji. In React, a naive `onKeyDown` listener listening for `Enter` will trigger immediately on IME conversion, prematurely submitting an exercise or flipping a flashcard.

### Mandatory IME Pattern:
```typescript
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // If the user is actively converting text via IME, ignore Enter
  if (e.nativeEvent.isComposing || e.key === 'Process') {
    return;
  }

  if (e.key === 'Enter') {
    handleSubmit();
  }
};
```

---

## 3. Furigana & Ruby Annotation

When displaying readings for Kanji, use standard HTML5 `<ruby>` markup:

```html
<ruby>
  私<rp>(</rp><rt>わたし</rt><rp>)</rp>
  は
  学生<rp>(</rp><rt>がくせい</rt><rp>)</rp>
  です。
</ruby>
```

### Parsing bracket-style Furigana:
Many learning decks store Furigana in bracket notation: `私[わたし]は学生[がくせい]です`.
A parser utility should convert `Word[reading]` into clean React/HTML `<ruby>` nodes:
- Match pattern: `([\u4e00-\u9faf]+)\[([\u3040-\u309f]+)\]`
- Do not clutter every card with Furigana unless the learner toggles "Show Readings" or the deck level requires it (N5 beginner mode).

---

## 4. Desktop Typography & Styling

### Font Stack Recommendation
To guarantee clear Kanji stroke separation on Windows, macOS, and Linux:
```css
font-family:
  "Noto Sans JP",
  "Hiragino Sans",
  "Yu Gothic",
  "Meiryo",
  system-ui,
  sans-serif;
```

### Readability Guidelines
- **Flashcard Kanji / Expressions:** Minimum `2rem` (32px) to `2.5rem` (40px) so complex Kanji strokes (e.g. `鬱`, `鑑`, `曜`) are easily legible.
- **Example Sentences:** Minimum `1.125rem` (18px) with `line-height: 1.8` or `2.0` to accommodate Furigana above characters without line collision.
- **Form Inputs:** Minimum `1.25rem` (20px) with comfortable padding.

---

## 5. Verification Checklist

- [ ] Does Japanese text input ignore `Enter` while `e.nativeEvent.isComposing` is true?
- [ ] Is font rendering crisp on Windows (antialiased, adequate font size)?
- [ ] Are Ruby annotations styled with appropriate font size (typically 50% of the base text size)?
- [ ] Are searches over vocabulary normalized to support searching by either Kanji (`食べる`) or Hiragana (`たべる`)?
