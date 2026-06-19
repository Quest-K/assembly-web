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
      // 모든 필드를 매칭하여 저장합니다.
      await supabase.from('politicians').upsert({
        name: m.HG_NM,               // 이름
        hj_name: m.HJ_NM || '',       // 한자명
        birth_date: m.BTH_DATE || '', // 생년월일
        district: m.ORIG_NM || '',    // 선거구
        party: m.POLY_NM || '무소속', // 정당
        committee: m.CMIT_NM || '',   // 상임위
        election_count: m.RELE_GUBUN || '', // 당선횟수
        homepage: m.HOMEPAGE || '',   // 홈페이지
        office_phone: m.MONA_CD || '',// 전화번호
        secretary: m.SECRETARY || '', // 보좌관
        secretary2: m.SECRETARY2 || '',// 보좌관2
        asist: m.ASIST || '',         // 비서관
        zip_no: m.ZIP_NO || '',       // 우편번호
        addr: m.ADDR || ''            // 주소
      }, { onConflict: 'name' });
    }
    return NextResponse.json({ success: true, count: members.length });
  } catch (error) {
    return NextResponse.json({ success: false, error: '저장 실패' }, { status: 500 });
  }
}
