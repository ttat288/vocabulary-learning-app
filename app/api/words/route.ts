import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import wordsEn from '@/public/data/words-en.json';
import wordsVi from '@/public/data/words-vi.json';

export async function GET(request: NextRequest) {
  const language = request.nextUrl.searchParams.get('lang') || 'en';
  
  const wordsByLanguage: Record<string, typeof wordsEn> = {
    en: wordsEn,
    vi: wordsVi,
  };
  
  const words = wordsByLanguage[language] || wordsEn;
  
  return NextResponse.json(words);
}
