import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const res = await fetch(`https://open.assembly.go.kr/portal/openapi/nwvrqwxyaytdsfvhu?KEY=${process.env.NATIONAL_ASSEMBLY_API_KEY}&Type=json&pSize=300`);
    const data = await res.json();
    const members = data.nwvrqwxyaytdsfvhu[1].row;

    for (const m of members) {
      // name을 기준으로 중복 확인 후 업데이트
      const { error } = await supabase.from('politicians').upsert({
        name: m.HG_NM,
        hj_name: m.HJ_NM || null,
        birth_date: m.BTH_DATE ? m.BTH_DATE.replace(/-/g, '') : null, // 날짜 형식 처리
        district: m.ORIG_NM || null,
        party: m.POLY_NM || '무소속',
        committee: m.CMIT_NM || null,
        election_count: m.RELE_GUBUN === '초선' ? 1 : 2, // 숫자로 변환 필요 시
        homepage: m.HOMEPAGE || null,
        office_phone: m.MONA_CD || null,
        secretary: m.SECRETARY || null,
        secretary2: m.SECRETARY2 || null,
        asist: m.ASIST || null,
        zip_no: m.ZIP_NO || null,
        addr: m.ADDR || null
      }, { onConflict: 'name' });

      if (error) throw error; // 에러 발생 시 즉시 캐치로 넘어감
    }
    return NextResponse.json({ success: true, count: members.length });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      message: error.message, // 여기서 정확한 DB 에러 이유를 알려줍니다.
      details: error.details 
    }, { status: 500 });
  }
}
