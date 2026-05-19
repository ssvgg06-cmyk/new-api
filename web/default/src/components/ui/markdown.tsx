/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface MarkdownProps {
  children: string
  className?: string
}

async function copyValueToClipboard(value: string) {
  if (!value) return
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
      toast.success('已复制到剪贴板')
      return
    }
  } catch {
    /* fall through to legacy */
  }
  if (typeof document === 'undefined') return
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  try {
    document.execCommand('copy')
    toast.success('已复制到剪贴板')
  } catch {
    toast.error('复制失败,请手动选中复制')
  } finally {
    document.body.removeChild(textarea)
  }
}

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none',
        'prose-headings:font-semibold prose-headings:tracking-tight',
        'prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg',
        'prose-p:leading-relaxed prose-p:my-2',
        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
        'prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none',
        'prose-pre:bg-muted prose-pre:border',
        'prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1',
        'prose-ul:my-2 prose-ol:my-2 prose-li:my-1',
        'prose-table:border prose-thead:bg-muted',
        'prose-td:border prose-th:border prose-td:px-3 prose-th:px-3',
        'prose-img:rounded-lg prose-img:shadow-sm',
        '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
        '[overflow-wrap:anywhere] break-words',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Same-origin / in-page links stay in place; only external links
          // open in a new tab. javascript: hrefs (e.g. copy-to-clipboard
          // shortcuts inside DB-injected HomePageContent) must NOT be
          // promoted to target=_blank or the browser tries to navigate.
          // Anchors carrying `data-copy="..."` become inline copy buttons.
          a: ({ node: _node, href, onClick, ...rest }) => {
            const raw = typeof href === 'string' ? href : ''
            // react-markdown lowercases unknown attrs but rehype-raw keeps
            // hyphenated data attributes; both ways are supported below.
            const r = rest as Record<string, unknown>
            const copyValue =
              (r['data-copy'] as string | undefined) ??
              (r['dataCopy'] as string | undefined) ??
              ''
            const isExternal = /^https?:\/\//i.test(raw)
            const isJsHref = raw.toLowerCase().startsWith('javascript:')
            const isAnchor = raw.startsWith('#')
            const isMailto = raw.toLowerCase().startsWith('mailto:')
            const openInNewTab =
              isExternal && !isJsHref && !isAnchor && !isMailto && !copyValue
            const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
              if (copyValue) {
                event.preventDefault()
                event.stopPropagation()
                void copyValueToClipboard(copyValue)
                return
              }
              if (isJsHref) {
                // Block legacy `href="javascript:..."` strings entirely; we
                // can't (and shouldn't) execute arbitrary inline JS.
                event.preventDefault()
                return
              }
              if (typeof onClick === 'function') {
                onClick(event)
              }
            }
            return (
              <a
                {...rest}
                href={isJsHref ? undefined : href}
                onClick={handleClick}
                {...(openInNewTab
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
              />
            )
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
