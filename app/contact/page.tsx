import type { Metadata } from 'next';

import { PageSection, StaticPage } from '@/components/public/static-page';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact languageflow for support, privacy, and product feedback.',
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactPage() {
  return (
    <StaticPage
      title='Contact'
      description='Get in touch about languageflow support, feedback, privacy, or advertising questions.'
    >
      <PageSection title='Email'>
        <p>
          Contact us at{' '}
          <a className='text-primary underline' href='mailto:contact@languageflow.io.vn'>
            contact@languageflow.io.vn
          </a>
          .
        </p>
        <p>
          Before applying for ads, make sure this mailbox exists or forward it
          to an inbox you check.
        </p>
      </PageSection>

      <PageSection title='Support topics'>
        <ul className='list-disc space-y-1 pl-5'>
          <li>Vocabulary learning issues</li>
          <li>AI explanation feedback</li>
          <li>Privacy and data questions</li>
          <li>Advertising or partnership inquiries</li>
        </ul>
      </PageSection>
    </StaticPage>
  );
}
