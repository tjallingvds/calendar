# Blog Markdown Guide

This guide shows how to format your blog posts using markdown syntax.

## Basic Formatting

### Headers
```
## Main Section Header
### Subsection Header
```

### Bold Text
```
**Bold text:** followed by regular text
```

---

## Lists

### Bullet Lists
```
- First item
- Second item
- Third item
```

### Numbered Lists
```
1. First step
2. Second step
3. Third step
```

---

## Special Features

### Blockquotes
```
> This is a quoted text or pull quote.
> Can span multiple lines.
```

### Footnotes

**In your text:**
```
This is a sentence with a footnote[^1] reference.
Another sentence with a different footnote[^2].
```

**At the end of your post:**
```
[^1]: This is the first footnote explanation.
[^2]: This is the second footnote.
```

- Footnotes appear as superscript numbers [1] in your text
- Click them to jump to the explanation at the bottom
- Click the number in the footnote section to jump back

---

## Mentions & Special Sections

### Shoutouts
```
Thanks to @Rachel for the inspiration.
Shoutout to @Sam for feedback.
```
- Any word starting with @ becomes a highlighted mention

### AI Disclosure
```
[AI] This section was written with AI assistance to help clarify technical concepts.
```
- Creates a distinct box to indicate AI-assisted content
- Should be on its own paragraph

---

## Full Example

```
## My Thoughts on Writing

The first paragraph has a dropcap automatically applied[^1].

Regular paragraphs are spaced nicely with 1.8 line-height for comfortable reading.

### Why I Write

I write because @Virginia once said writing is thinking on paper. This resonates deeply with me[^2].

> "The only way to do great work is to love what you do."

**Key principles:**
- Write every day
- Edit ruthlessly
- Share openly

1. Start with an outline
2. Draft without judging
3. Revise with fresh eyes

[AI] The following statistics were compiled with AI assistance from public research data.

[^1]: The dropcap is a classical typographic feature borrowed from old manuscripts.
[^2]: Virginia Woolf, from her essay "A Room of One's Own."
```

---

## Tips

- **Line breaks:** Double line break creates new paragraphs
- **Reading time:** Automatically calculated (~200 words/min)
- **Themes:** Tag posts with themes when creating them
- **Preview:** Always preview before publishing to check formatting

## What Gets Styled

✓ Headers (## and ###)  
✓ Bold text (**text**)  
✓ Bullet lists (-)  
✓ Numbered lists (1. 2. 3.)  
✓ Blockquotes (>)  
✓ Footnotes ([^1] and [^1]:)  
✓ Shoutouts (@name)  
✓ AI statements ([AI])  

---

**Color Palette:**
- Main text: `#1a1a1a` (warm black)
- Secondary text: `#666` (muted gray)
- Borders: `#e5e5e5` (subtle)
- Highlights: `rgba(0,0,0,0.015)` (barely there)

