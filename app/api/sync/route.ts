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
    
    // 데이터 구조 안전하게 확인
    const members = data?.nwvrqwxyaytdsfvhu?.[1]?.row;
    
    if (!members) {
      return NextResponse.json({ success: false, message: "API 데이터를 찾을 수 없습니다." }, { status: 500 });
    }

    for (const m of members) {
      await supabase.from('politicians').upsert({
        name: m.HG_NM,
        hj_name: m.HJ_NM || null,
        birth_date: m.BTH_DATE || null,
        district: m.ORIG_NM || null,
        party: m.POLY_NM || '무소속',
        committee: m.CMIT_NM || null,
        election_count: m.RELE_GUBUN || null,
        homepage: m.HOMEPAGE || null,
        office_phone: m.MONA_CD || null,
        secretary: m.SECRETARY || null,
        secretary2: m.SECRETARY2 || null,
        asist: m.ASIST || null,
        zip_no: m.ZIP_NO || null,
        addr: m.ADDR || null
      }, { onConflict: 'name' });
    }

    return NextResponse.json({ success: true, count: members.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
