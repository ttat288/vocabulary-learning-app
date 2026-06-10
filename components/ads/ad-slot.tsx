'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSlotProps {
  slot?: string;
  className?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
}

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;

export function AdSlot({ slot, className, format = 'auto' }: AdSlotProps) {
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!ADSENSE_CLIENT || !slot || pushedRef.current) return;

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      pushedRef.current = true;
    } catch (error) {
      console.error('[ads] Failed to render AdSense slot:', error);
    }
  }, [slot]);

  if (!ADSENSE_CLIENT || !slot) return null;

  return (
    <div className={className}>
      <ins
        className='adsbygoogle block'
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive='true'
      />
    </div>
  );
}
