import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const apiKey = process.env.NATIONAL_ASSEMBLY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, message: "API 키가 설정되지 않았습니다." }, { status: 500 });
  }

  try {
    const url = `https://open.assembly.go.kr/portal/openapi/nwvrqwxyaytdsfvhu?KEY=${apiKey}&Type=json&pSize=300`;
    const res = await fetch(url);
    const data = await res.json();
    
    // 데이터 경로 확인 (API 구조에 따라 다를 수 있음)
    const members = data?.nwvrqwxyaytdsfvhu?.[1]?.row;
    if (!members) throw new Error('API 데이터를 찾을 수 없습니다.');

    for (const m of members) {
      // 데이터가 있는 항목만 필터링하여 매핑
      const payload: any = {
        name: m.HG_NM,
        hj_name: m.HJ_NM || null,
        eng_name: m.ENG_NM || null,
        bth_gbn: m.BTH_GBN_NM || null,
        birth_date: m.BTH_DATE || null,
        party: m.POLY_NM || null,
        district: m.ORIG_NM || null,
        committee: m.CMIT_NM || null,
        committees: m.CMITS || null,
        reele_gbn: m.REELE_GBN_NM || null,
        units: m.UNITS || null,
        sex: m.SEX_GBN_NM || null,
        tel: m.TEL_NO || null,
        email: m.E_MAIL || null,
        homepage: m.HOMEPAGE || null,
        staff: m.STAFF || null,
        secretary: m.SECRETARY || null,
        secretary2: m.SECRETARY2 || null,
        assem_addr: m.ASSEM_ADDR || null
      };

      // 테이블에 upsert
      const { error } = await supabase
        .from('politicians')
        .upsert(payload, { onConflict: 'name' });

      if (error) console.error(`저장 실패 (${m.HG_NM}):`, error);
    }

    return NextResponse.json({ success: true, count: members.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
