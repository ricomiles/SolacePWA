import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Placeholder from '@tiptap/extension-placeholder'

function toHTML(value) {
  if (!value) return ''
  if (value.trimStart().startsWith('<')) return value
  return value
    .split(/\n\n+/)
    .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
    .join('')
}

export default function RichTextEditor({ initialContent, onChange, onEditorReady, placeholder, className, style }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      TextStyle,
      Color,
      Placeholder.configure({ placeholder: placeholder || '' }),
    ],
    content: toHTML(initialContent),
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  useEffect(() => {
    if (editor && onEditorReady) onEditorReady(editor)
  }, [editor, onEditorReady])

  return (
    <div className={`rich-editor${className ? ` ${className}` : ''}`} style={style}>
      <EditorContent editor={editor} />
    </div>
  )
}
