import { useEffect, useState } from 'react'

export const RED_COLOR = '#B85450'

function ToolBtn({ active, onAction, children, title, size = 34 }) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onAction() }}
      title={title}
      style={{
        width: size, height: size, borderRadius: 8, flexShrink: 0,
        background: active ? 'rgba(58,51,43,0.12)' : 'transparent',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--ink-700)',
        transition: 'background 0.1s',
      }}
    >
      {children}
    </button>
  )
}

export default function FormattingToolbar({ editor, size }) {
  const [, tick] = useState(0)

  useEffect(() => {
    if (!editor) return
    const update = () => tick(n => n + 1)
    editor.on('selectionUpdate', update)
    editor.on('transaction', update)
    return () => {
      editor.off('selectionUpdate', update)
      editor.off('transaction', update)
    }
  }, [editor])

  if (!editor) return null

  const isBold = editor.isActive('bold')
  const isItalic = editor.isActive('italic')
  const isHighlight = editor.isActive('highlight')
  const isRed = editor.isActive('textStyle', { color: RED_COLOR })

  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <ToolBtn active={isBold} onAction={() => editor.chain().focus().toggleBold().run()} title="Bold" size={size}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M3.5 2h4a2 2 0 010 4 2 2 0 010 4h-4V2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      </ToolBtn>
      <ToolBtn active={isItalic} onAction={() => editor.chain().focus().toggleItalic().run()} title="Italic" size={size}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <line x1="8.5" y1="2" x2="4.5" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="4" y1="2" x2="9" y2="2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="4" y1="11" x2="9" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </ToolBtn>
      <ToolBtn active={isHighlight} onAction={() => editor.chain().focus().toggleHighlight().run()} title="Highlight" size={size}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <rect x="2" y="4" width="9" height="5" rx="1"
            fill={isHighlight ? '#FDE68A' : 'none'}
            stroke="currentColor" strokeWidth="1.2" />
          <line x1="4.5" y1="9" x2="3.5" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="8.5" y1="9" x2="9.5" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </ToolBtn>
      <ToolBtn
        active={isRed}
        onAction={() => isRed
          ? editor.chain().focus().unsetColor().run()
          : editor.chain().focus().setColor(RED_COLOR).run()
        }
        title="Red text"
        size={size}
      >
        <span style={{
          fontFamily: 'var(--serif)', fontSize: 13, fontWeight: 700, lineHeight: 1,
          color: isRed ? RED_COLOR : 'var(--ink-500)',
          borderBottom: `2px solid ${RED_COLOR}`,
          paddingBottom: 0,
        }}>A</span>
      </ToolBtn>
    </div>
  )
}
