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
*/

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const WECHAT_ID = 'TagPup'
const QR_SRC = '/wechat-qr.jpg'

interface SupportPopoverProps {
  className?: string
  /**
   * Slim variant uses a plain icon button (for compact toolbars).
   * Otherwise renders as a text-style nav link to match neighboring items.
   */
  variant?: 'text' | 'icon'
}

/**
 * 客服 / Customer Support entry — click to reveal WeChat contact and QR.
 * Click-triggered Popover works on both desktop and mobile (hover-only
 * variants are inaccessible on touch devices).
 */
export function SupportPopover({
  className,
  variant = 'text',
}: SupportPopoverProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const handleCopyId = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(WECHAT_ID)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard unavailable, ignore */
    }
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          variant === 'icon' ? (
            <button
              type='button'
              className={cn(
                'text-muted-foreground hover:bg-accent hover:text-foreground inline-flex size-8 items-center justify-center rounded-md transition-colors',
                className
              )}
              aria-label={t('Customer Support', '客服')}
            >
              <MessageCircle className='size-4' />
            </button>
          ) : (
            <button
              type='button'
              className={cn(
                'text-muted-foreground hover:text-foreground inline-flex h-8 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors duration-200',
                className
              )}
            >
              <MessageCircle className='size-3.5' aria-hidden='true' />
              <span>{t('Customer Support', '客服')}</span>
            </button>
          )
        }
      />
      <PopoverContent
        side='bottom'
        align='end'
        sideOffset={10}
        className='w-64 p-3'
      >
        <div className='flex flex-col items-center gap-2'>
          <div className='text-foreground/90 text-xs font-medium tracking-wide'>
            {t('Scan or add WeChat', '扫码或添加微信')}
          </div>
          <img
            src={QR_SRC}
            alt={t('Customer Support WeChat QR', '客服微信二维码')}
            className='h-44 w-44 rounded-md border bg-white object-contain p-1'
            draggable={false}
          />
          <button
            type='button'
            onClick={handleCopyId}
            className='bg-muted/40 hover:bg-muted/70 mt-1 inline-flex h-7 items-center gap-1 rounded-md px-2 font-mono text-xs transition-colors'
            title={t('Copy WeChat ID', '复制微信号')}
          >
            <span className='text-muted-foreground'>{t('WeChatLabel', '微信号')}:</span>
            <span className='text-foreground'>{WECHAT_ID}</span>
            <span className='text-muted-foreground ml-1 text-[10px]'>
              {copied ? t('Copied', '已复制') : t('Copy', '复制')}
            </span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
