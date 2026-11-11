# MYA design tokens

화면을 만들 때 어떤 토큰을 쓰는지는 [design-token-guide.md](./design-token-guide.md)를 따른다.

Source: Figma file `🤖 MYA_Design-System`, Foundation page, section `style guide`.

- `design-tokens.json`: platform-neutral, DTCG-style source tokens with aliases.
- `design-tokens.css`: ready-to-use CSS custom properties.

Colors follow the local variable libraries (`♢ Color Primitive`, `♢ Color Semantic`).
Text styles follow the local text styles (`ios/*`, `mac/*`). Effects follow the
local effect styles. The style-guide swatches are bound to the color variables and
their labels show the variable values.

## Source coverage

- 5 local variable collections
- 176 variables inside those collections
- 23 local text styles
- 7 local effect styles
- Color primitives and semantic aliases, including mint, violet, muted, and opacity
- Padding, gap, radius primitives and semantic aliases
- Typography primitives and iOS/macOS composite text styles
- Shadow, glass, and background-blur effects

All source collections currently contain one mode (`Mode 1`). Figma's typography
`Spacing/*` variables represent letter spacing, so they are stored under
`typography.primitive.letterSpacing`, not layout spacing.

Each Figma text style is bound to typography variables, so composite text tokens
reference the matching primitives (`var(--font-size-*)`, `{typography.primitive.*}`)
instead of copying numbers.

Shadow effects use the `LINEAR_BURN` blend mode in Figma; CSS `box-shadow` renders
them with normal blending. Figma `GLASS` effects have no CSS equivalent, so the CSS
tokens approximate them with `backdrop-filter: blur()` using the effect radius.

The source names `Weight/weignt-*` contain a typo. Token paths normalize this to
`fontWeight`, and the source strings `Regular` / `Medium` / `Semibold` / `Bold`
are stored as CSS weights `400` / `500` / `600` / `700`. Figma's `SemiBold` text
style is weight `600`. Opacity source names `Wpacity`, `Bpacity`, and `Cpacity`
are stored as `opacity.white`, `opacity.black`, and `opacity.color`.

## Webfont

`design-tokens.css` imports Wanted Sans v1.0.3 from jsDelivr
(`wanteddev/wanted-sans`, static split build, SIL Open Font License 1.1). The
stylesheet registers the family `"Wanted Sans"` with weights 400–1000 and splits
each weight by Unicode range, so browsers download only the subsets a page uses.
The version is pinned; update the `@import` tag to move to a newer release.

## CSS usage

```css
.card {
  padding: var(--padding-card-md);
  gap: var(--gap-md);
  border-radius: var(--radius-card-md);
  color: var(--color-text-primary);
  background: var(--color-surface-default);
}

.title {
  font: var(--type-ios-title-large-font);
  letter-spacing: var(--type-ios-title-large-tracking);
}
```
