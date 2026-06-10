import type { Metadata } from 'next';

import { PageSection, StaticPage } from '@/components/public/static-page';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description:
    'Terms of Use for LanguageFlow, an English vocabulary learning app.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <StaticPage
      title='Terms of Use'
      description='Rules for using LanguageFlow and its learning features.'
      updatedAt='June 10, 2026'
    >
      <PageSection title='Use of the service'>
        <p>
          LanguageFlow is provided as a vocabulary learning tool. You may use it
          for personal study, review, and English practice.
        </p>
      </PageSection>

      <PageSection title='Learning content'>
        <p>
          Vocabulary definitions, examples, quizzes, and AI explanations are for
          learning support only. They may contain mistakes and should not be used
          as professional, legal, medical, or financial advice.
        </p>
      </PageSection>

      <PageSection title='AI-generated responses'>
        <p>
          AI responses are generated automatically from vocabulary context and
          user input. You are responsible for reviewing AI output before relying
          on it. Do not submit sensitive personal information.
        </p>
      </PageSection>

      <PageSection title='Acceptable use'>
        <p>
          Do not misuse the service, interfere with the app, attempt to bypass
          rate limits, or use the service for unlawful or harmful activity.
        </p>
      </PageSection>

      <PageSection title='Advertising'>
        <p>
          LanguageFlow may display advertising. Do not click ads in a misleading
          or automated way.
        </p>
      </PageSection>

      <PageSection title='Changes'>
        <p>
          We may update these terms as the app evolves. Continued use of
          LanguageFlow means you accept the current terms.
        </p>
      </PageSection>

      <PageSection title='Contact'>
        <p>
          For questions, contact{' '}
          <a className='text-primary underline' href='mailto:contact@languageflow.io.vn'>
            contact@languageflow.io.vn
          </a>
          .
        </p>
      </PageSection>
    </StaticPage>
  );
}
