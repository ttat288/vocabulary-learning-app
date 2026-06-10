import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StaticPageProps {
  title: string;
  description: string;
  updatedAt?: string;
  children: React.ReactNode;
}

export function StaticPage({
  title,
  description,
  updatedAt,
  children,
}: StaticPageProps) {
  return (
    <main className='min-h-screen bg-background px-4 py-8 text-foreground'>
      <div className='mx-auto max-w-3xl'>
        <Link
          href='/'
          className={buttonVariants({
            variant: 'outline',
            size: 'sm',
            className: 'mb-6 gap-2',
          })}
        >
          <ArrowLeft className='h-3.5 w-3.5' aria-hidden />
          Back to LanguageFlow
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className='text-3xl leading-tight sm:text-4xl'>
              {title}
            </CardTitle>
            <p className='text-sm leading-6 text-muted-foreground'>
              {description}
            </p>
            {updatedAt && (
              <p className='text-xs text-muted-foreground'>
                Last updated: {updatedAt}
              </p>
            )}
          </CardHeader>
          <CardContent className='space-y-6 text-sm leading-7 text-card-foreground'>
            {children}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export function PageSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className='space-y-2'>
      <h2 className='text-lg font-semibold text-foreground'>{title}</h2>
      <div className='space-y-2 text-muted-foreground'>{children}</div>
    </section>
  );
}
