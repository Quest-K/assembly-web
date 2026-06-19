import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Vercel 환경 변수를 사용하여 클라이언트 생성
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const res = await fetch(`https://open.assembly.go.kr/portal/openapi/nwvrqwxyaytdsfvhu?KEY=${process.env.NATIONAL_ASSEMBLY_API_KEY}&Type=json&pSize=300`);
    if (!res.ok) throw new Error('국회 API 호출 실패');
    
    const data = await res.json();
    const members = data.nwvrqwxyaytdsfvhu[1].row;

    // 데이터 upsert (이름 기준 중복 방지)
    for (const m of members) {
      await supabase.from('politicians').upsert({
        name: m.HG_NM,
        hj_name: m.HJ_NM || '',
        birth_date: m.BTH_DATE || '',
        district: m.ORIG_NM || '',
        party: m.POLY_NM || '무소속',
        committee: m.CMIT_NM || '미정',
        election_count: m.RELE_GUBUN || '초선',
        homepage: m.HOMEPAGE || '',
        office_phone: m.MONA_CD || '',
        secretary: m.SECRETARY || '',
        secretary2: m.SECRETARY2 || '',
        asist: m.ASIST || ''
      }, { onConflict: 'name' });
    }

    return NextResponse.json({ success: true, count: members.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: '동기화 실패' }, { status: 500 });
  }
}
