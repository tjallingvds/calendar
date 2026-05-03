import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    citation: {
      insertCitation: (source: string) => ReturnType;
    };
  }
}

// Inline atomic node carrying the citation source. Renders as `<span data-citation data-source="...">[cite]</span>`
// in storage. The public-side renderer auto-numbers them and appends a Notes section.
export const Citation = Node.create({
  name: 'citation',
  inline: true,
  group: 'inline',
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      source: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-source') || '',
        renderHTML: (attrs) => ({ 'data-source': attrs.source }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-citation]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { 'data-citation': '', class: 'citation-marker' }),
      '[cite]',
    ];
  },

  addCommands() {
    return {
      insertCitation:
        (source: string) =>
        ({ chain }) => {
          return chain()
            .insertContent({ type: this.name, attrs: { source } })
            .run();
        },
    };
  },
});
