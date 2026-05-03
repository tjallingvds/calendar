import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExt from '@tiptap/extension-image';
import LinkExt from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, LinkIcon, ImageIcon, Quote as CiteIcon,
  Minus, Undo, Redo,
} from 'lucide-react';
import { Citation } from './CitationExtension';
import { uploadImage } from '@/lib/api';

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export function RichEditor({ value, onChange }: RichEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      ImageExt.configure({ inline: false, allowBase64: false }),
      LinkExt.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: 'Write your essay…' }),
      Citation,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-content focus:outline-none min-h-[400px] px-4 py-4',
      },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) {
              event.preventDefault();
              uploadAndInsert(file);
              return true;
            }
          }
        }
        return false;
      },
      handleDrop: (_view, event) => {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;
        const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
        if (imageFiles.length === 0) return false;
        event.preventDefault();
        imageFiles.forEach(uploadAndInsert);
        return true;
      },
    },
  });

  // Sync external value updates (e.g. when switching between posts)
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  const uploadAndInsert = async (file: File) => {
    if (!editor) return;
    try {
      const { url } = await uploadImage(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Failed to upload image');
    }
  };

  const onPickImage = () => fileInputRef.current?.click();

  const onFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await uploadAndInsert(file);
  };

  const onAddLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL', previous || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const onAddCitation = () => {
    if (!editor) return;
    const source = window.prompt('Citation source (e.g. "Smith, J. (2024). Title. Journal.")');
    if (!source) return;
    editor.chain().focus().insertCitation(source).run();
  };

  if (!editor) return null;

  const Btn = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`h-8 w-8 inline-flex items-center justify-center rounded transition-colors ${
        active ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="rounded-lg border border-border/40 bg-background overflow-hidden">
      <style>{`
        .tiptap-content p { margin: 0.5em 0; }
        .tiptap-content h1 { font-size: 1.875rem; font-weight: 600; margin: 1em 0 0.5em; }
        .tiptap-content h2 { font-size: 1.5rem; font-weight: 600; margin: 0.9em 0 0.4em; }
        .tiptap-content h3 { font-size: 1.25rem; font-weight: 600; margin: 0.8em 0 0.3em; }
        .tiptap-content ul, .tiptap-content ol { padding-left: 1.5rem; margin: 0.5em 0; }
        .tiptap-content ul { list-style: disc; }
        .tiptap-content ol { list-style: decimal; }
        .tiptap-content blockquote { border-left: 3px solid #d4d4d4; padding-left: 1rem; color: #555; margin: 0.8em 0; font-style: italic; }
        .tiptap-content a { color: #2563eb; text-decoration: underline; text-underline-offset: 2px; }
        .tiptap-content img { max-width: 100%; border-radius: 4px; margin: 0.8em 0; }
        .tiptap-content hr { border: none; border-top: 1px solid #e5e5e5; margin: 1.5em 0; }
        .tiptap-content .citation-marker {
          display: inline-block;
          background: rgba(0,0,0,0.06);
          color: #555;
          padding: 0 0.4em;
          border-radius: 3px;
          font-size: 0.78em;
          font-family: ui-monospace, monospace;
          cursor: help;
        }
        .tiptap-content .ProseMirror-selectednode { outline: 2px solid #2563eb; }
        .tiptap-content p.is-editor-empty:first-child::before {
          color: #aaa;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>

      <div className="flex flex-wrap items-center gap-1 border-b border-border/40 px-2 py-1.5 bg-muted/20">
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <Bold className="h-4 w-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <Italic className="h-4 w-4" />
        </Btn>
        <div className="w-px h-5 bg-border/60 mx-1" />
        <Btn
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Btn>
        <div className="w-px h-5 bg-border/60 mx-1" />
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
          <List className="h-4 w-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
          <ListOrdered className="h-4 w-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote">
          <Quote className="h-4 w-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
          <Minus className="h-4 w-4" />
        </Btn>
        <div className="w-px h-5 bg-border/60 mx-1" />
        <Btn onClick={onAddLink} active={editor.isActive('link')} title="Link">
          <LinkIcon className="h-4 w-4" />
        </Btn>
        <Btn onClick={onPickImage} title="Insert image">
          <ImageIcon className="h-4 w-4" />
        </Btn>
        <Btn onClick={onAddCitation} title="Insert citation">
          <CiteIcon className="h-4 w-4" />
        </Btn>
        <div className="w-px h-5 bg-border/60 mx-1" />
        <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo className="h-4 w-4" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo className="h-4 w-4" />
        </Btn>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
          onChange={onFileChosen}
          className="hidden"
        />
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
