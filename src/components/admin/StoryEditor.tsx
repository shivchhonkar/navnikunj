'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, List, ListOrdered, Underline as UnderlineIcon, type LucideIcon } from 'lucide-react';
import { toEditorHtml } from '@/lib/story';

function normalize(html: string) {
  const clean = html.trim();
  if (!clean || clean === '<p></p>' || clean === '<p><br></p>') return '';
  return clean;
}

const BUTTON = 'inline-flex h-8 w-8 items-center justify-center rounded-md disabled:cursor-not-allowed';

function Tool({ label, icon: Icon, pressed, onPress, disabled, grouped }: {
  label: string;
  icon: LucideIcon;
  pressed: boolean;
  onPress: () => void;
  disabled?: boolean;
  grouped?: boolean;
}) {
  return (
    <span className={grouped ? 'ml-1 border-l border-stone-200 pl-1' : ''}>
      <button
        type="button"
        title={label}
        aria-label={label}
        aria-pressed={pressed}
        disabled={disabled}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onPress}
        className={`${BUTTON} ${pressed ? 'bg-white text-brand shadow-sm' : 'text-stone-600 hover:bg-white hover:text-ink'}`}
      >
        <Icon size={15} />
      </button>
    </span>
  );
}

export function StoryEditor({ value, onChange, disabled }: { value: string; onChange: (html: string) => void; disabled?: boolean }) {
  const emitted = useRef(normalize(toEditorHtml(value)));
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        strike: false,
      }),
      Underline,
      TextAlign.configure({ types: ['paragraph'] }),
    ],
    content: toEditorHtml(value),
    editorProps: {
      attributes: {
        'aria-label': 'Story',
        class: 'story min-h-40 px-3 py-2 text-sm leading-6 outline-none',
      },
    },
    onUpdate: ({ editor: current }) => {
      const html = normalize(current.getHTML());
      emitted.current = html;
      onChange(html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  const [, setTick] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const refresh = () => setTick((tick) => tick + 1);
    editor.on('selectionUpdate', refresh);
    editor.on('transaction', refresh);
    return () => {
      editor.off('selectionUpdate', refresh);
      editor.off('transaction', refresh);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const next = normalize(toEditorHtml(value));
    if (next === emitted.current) return;
    if (normalize(editor.getHTML()) === next) {
      emitted.current = next;
      return;
    }
    editor.commands.setContent(next, false);
    emitted.current = next;
  }, [editor, value]);

  if (!editor) {
    return <div className="mt-1 min-h-40 rounded-lg border border-stone-300 bg-white" />;
  }

  return (
    <div className={`story-editor mt-1 overflow-hidden rounded-lg border border-stone-300 bg-white ${disabled ? 'opacity-60' : ''}`}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-stone-200 bg-stone-50 p-1.5" role="toolbar" aria-label="Story formatting">
        <Tool label="Bold" icon={Bold} disabled={disabled} pressed={editor.isActive('bold')} onPress={() => editor.chain().focus().toggleBold().run()} />
        <Tool label="Italic" icon={Italic} disabled={disabled} pressed={editor.isActive('italic')} onPress={() => editor.chain().focus().toggleItalic().run()} />
        <Tool label="Underline" icon={UnderlineIcon} disabled={disabled} pressed={editor.isActive('underline')} onPress={() => editor.chain().focus().toggleUnderline().run()} />
        <Tool label="Align left" icon={AlignLeft} grouped disabled={disabled} pressed={editor.isActive({ textAlign: 'left' })} onPress={() => editor.chain().focus().setTextAlign('left').run()} />
        <Tool label="Align center" icon={AlignCenter} disabled={disabled} pressed={editor.isActive({ textAlign: 'center' })} onPress={() => editor.chain().focus().setTextAlign('center').run()} />
        <Tool label="Align right" icon={AlignRight} disabled={disabled} pressed={editor.isActive({ textAlign: 'right' })} onPress={() => editor.chain().focus().setTextAlign('right').run()} />
        <Tool label="Bulleted list" icon={List} grouped disabled={disabled} pressed={editor.isActive('bulletList')} onPress={() => editor.chain().focus().toggleBulletList().run()} />
        <Tool label="Numbered list" icon={ListOrdered} disabled={disabled} pressed={editor.isActive('orderedList')} onPress={() => editor.chain().focus().toggleOrderedList().run()} />
      </div>
      <p className="border-b border-stone-100 px-3 py-1.5 text-xs text-stone-500">Select text, then choose a style.</p>
      <EditorContent editor={editor} />
    </div>
  );
}
