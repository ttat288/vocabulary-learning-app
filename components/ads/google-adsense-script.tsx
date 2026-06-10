import Script from 'next/script';

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;

export function GoogleAdSenseScript() {
  if (!ADSENSE_CLIENT) return null;

  return (
    <Script
      id='google-adsense'
      async
      strategy='afterInteractive'
      crossOrigin='anonymous'
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
    />
  );
}
