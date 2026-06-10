function getPublisherId() {
  const rawId =
    process.env.GOOGLE_ADSENSE_PUBLISHER_ID ||
    process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT ||
    '';

  return rawId.trim().replace(/^ca-/, '');
}

export function GET() {
  const publisherId = getPublisherId();
  const body = publisherId
    ? `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`
    : [
        '# Google AdSense ads.txt placeholder',
        '# Set GOOGLE_ADSENSE_PUBLISHER_ID=pub-xxxxxxxxxxxxxxxx',
        '# or NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT=ca-pub-xxxxxxxxxxxxxxxx',
        '',
      ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
