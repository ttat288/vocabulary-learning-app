import type { Metadata } from 'next';

import { PageSection, StaticPage } from '@/components/public/static-page';

export const metadata: Metadata = {
  title: 'English Vocabulary Study Tips',
  description:
    'Practical English vocabulary study tips for examples, review, collocations, pronunciation, and word comparison.',
  alternates: {
    canonical: '/english-tips',
  },
};

export default function EnglishTipsPage() {
  return (
    <StaticPage
      title='English Vocabulary Study Tips'
      description='Practical ways to remember words and use them more naturally.'
    >
      <PageSection title='Study words in real examples'>
        <p>
          A definition is useful, but a sentence shows how a word behaves.
          Notice the verbs, prepositions, and nouns that appear near the word.
          These patterns help you speak and write more naturally.
        </p>
      </PageSection>

      <PageSection title='Review words you miss'>
        <p>
          Forgetting is part of learning. When you miss a word, review it again
          later instead of trying to memorize everything in one long session.
          Short review loops are easier to maintain.
        </p>
      </PageSection>

      <PageSection title='Compare similar words'>
        <p>
          Many English words have similar translations but different usage.
          Compare pairs like <strong>say</strong> and <strong>tell</strong>,{' '}
          <strong>look</strong> and <strong>see</strong>, or{' '}
          <strong>job</strong> and <strong>work</strong>. The difference often
          becomes clear through examples.
        </p>
      </PageSection>

      <PageSection title='Practice active recall'>
        <p>
          Before checking the answer, try to remember the meaning or make your
          own sentence. This forces your brain to retrieve the word, which is
          more effective than only rereading.
        </p>
      </PageSection>

      <PageSection title='Use pronunciation as a memory hook'>
        <p>
          Listening to pronunciation helps connect spelling, sound, and meaning.
          Say the word aloud once, then read the example sentence. This makes the
          word easier to recognize later.
        </p>
      </PageSection>
    </StaticPage>
  );
}
