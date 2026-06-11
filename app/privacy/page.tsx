import type { Metadata } from 'next';

import { PageSection, StaticPage } from '@/components/public/static-page';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy Policy for languageflow, including local storage, analytics, advertising, cookies, and AI learning features.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <StaticPage
      title='Privacy Policy'
      description='How languageflow handles learning data, analytics, advertising, cookies, and AI-assisted features.'
      updatedAt='June 10, 2026'
    >
      <PageSection title='Overview'>
        <p>
          languageflow is an English vocabulary learning app. We keep the app
          lightweight and do not require account registration for core study
          features.
        </p>
      </PageSection>

      <PageSection title='Information stored on your device'>
        <p>
          Study progress, settings, theme preferences, language preferences, and
          AI toggle preferences are stored in your browser using localStorage.
          This data stays on your device unless you clear browser storage.
        </p>
      </PageSection>

      <PageSection title='AI features'>
        <p>
          When you ask for an AI explanation, quiz, sentence check, or word
          comparison, the current vocabulary context and any text you submit are
          sent to our AI API route so a response can be generated. Do not submit
          sensitive personal information in AI prompts.
        </p>
      </PageSection>

      <PageSection title='Analytics'>
        <p>
          languageflow may use privacy-conscious analytics, such as Vercel
          Analytics, to understand aggregate usage and improve the product.
        </p>
      </PageSection>

      <PageSection title='Advertising and cookies'>
        <p>
          languageflow may display ads through Google AdSense or similar
          advertising partners. Advertising partners may use cookies, device
          identifiers, and similar technologies to serve, measure, and improve
          ads. You can control cookies through your browser settings and, where
          required, through consent controls shown on the site.
        </p>
      </PageSection>

      <PageSection title='Third-party services'>
        <p>
          We may use third-party services for hosting, analytics, advertising,
          and AI responses. These providers process data according to their own
          policies and the configuration used by languageflow.
        </p>
      </PageSection>

      <PageSection title='Contact'>
        <p>
          For privacy questions, contact us at{' '}
          <a className='text-primary underline' href='mailto:contact@languageflow.io.vn'>
            contact@languageflow.io.vn
          </a>
          .
        </p>
      </PageSection>
    </StaticPage>
  );
}
