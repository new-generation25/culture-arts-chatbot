import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;
  const model = 'gpt-4.1-mini-2025-04-14';

  if (!apiKey) {
    return NextResponse.json({ error: 'OpenAI API 키가 설정되어 있지 않습니다.' }, { status: 500 });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: '당신은 문화예술 분야의 친절한 챗봇입니다.' },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.error?.message || 'OpenAI API 호출 실패' }, { status: 500 });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || '답변을 생성하지 못했습니다.';
    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 