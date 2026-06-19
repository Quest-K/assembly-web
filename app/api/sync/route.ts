import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // 공공데이터포털 API 호출
    const url = `https://open.assembly.go.kr/portal/openapi/nwvrqwxyaytdsfvhu?KEY=${process.env.NATIONAL_ASSEMBLY_API_KEY}&Type=json&pSize=300`;
    const res = await fetch(url);
    const data = await res.json();
    
    // 데이터 추출 (구조 확인)
    const members = data?.nwvrqwxyaytdsfvhu?.[1]?.row;
    if (!members) throw new Error('API 데이터를 가져오지 못했습니다.');

    for (const m of members) {
      await supabase.from('politicians').upsert({
        name: m.HG_NM,
        hj_name: m.HJ_NM || null,
        eng_name: m.ENG_NM || null,
        bth_gbn: m.BTH_GBN_NM || null,
        birth_date: m.BTH_DATE || null,
        job_res: m.JOB_RES_NM || null,
        party: m.POLY_NM || '무소속',
        district: m.ORIG_NM || null,
        elect_gbn: m.ELECT_GBN_NM || null,
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
        mona_cd: m.MONA_CD || null,
        mem_title: m.MEM_TITLE || null,
        assem_addr: m.ASSEM_ADDR || null
      }, { onConflict: 'name' });
    }

    return NextResponse.json({ success: true, count: members.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
