import type { Metadata } from 'next';

import { PageSection, StaticPage } from '@/components/public/static-page';

export const metadata: Metadata = {
  title: 'About',
  description:
    'About LanguageFlow, a focused English vocabulary practice app with review and AI learning help.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <StaticPage
      title='About LanguageFlow'
      description='A focused English vocabulary practice app built for short, repeatable study sessions.'
    >
      <PageSection title='What LanguageFlow does'>
        <p>
          LanguageFlow helps learners practice English vocabulary through daily
          study goals, examples, pronunciation support, review queues, and
          optional AI learning help.
        </p>
      </PageSection>

      <PageSection title='How it helps learners'>
        <ul className='list-disc space-y-1 pl-5'>
          <li>Choose a study goal and practice a manageable set of words.</li>
          <li>Review words you miss so weak vocabulary comes back later.</li>
          <li>Read definitions, examples, and translations in a focused card.</li>
          <li>Use AI when you want examples, usage notes, quizzes, or comparisons.</li>
        </ul>
      </PageSection>

      <PageSection title='Learning philosophy'>
        <p>
          The app is designed to keep study sessions simple. Instead of showing
          many distractions at once, LanguageFlow focuses on one word, one
          decision, and one clear next step.
        </p>
      </PageSection>
    </StaticPage>
  );
}
