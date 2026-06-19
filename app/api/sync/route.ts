import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 설정
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
    // 국회 API 호출
    const url = `https://open.assembly.go.kr/portal/openapi/nwvrqwxyaytdsfvhu?KEY=${apiKey}&Type=json&pSize=300`;
    const res = await fetch(url);
    const data = await res.json();
    
    // 데이터 구조 추출
    const members = data?.nwvrqwxyaytdsfvhu?.[1]?.row;
    if (!members) throw new Error('API 데이터를 불러올 수 없습니다.');

    // API 항목과 테이블 컬럼 매칭
    const payload = members.map((m: any) => ({
      name: m.HG_NM,
      hj_name: m.HJ_NM,
      eng_name: m.ENG_NM,
      bth_gbn: m.BTH_GBN_NM,
      birth_date: m.BTH_DATE,
      party: m.POLY_NM,
      district: m.ORIG_NM,
      cmit_nm: m.CMIT_NM,
      cmits: m.CMITS,
      reele_gbn: m.REELE_GBN_NM,
      units: m.UNITS,
      sex: m.SEX_GBN_NM,
      tel: m.TEL_NO,
      email: m.E_MAIL,
      homepage: m.HOMEPAGE,
      staff: m.STAFF,
      secretary: m.SECRETARY,
      secretary2: m.SECRETARY2,
      mem_title: m.MEM_TITLE,
      assem_addr: m.ASSEM_ADDR
    }));

    // 데이터 삽입 (기존 데이터가 있다면 지우고 새로 넣는 방식)
    // 혹은 .upsert()를 사용하면 기존 데이터 갱신도 가능합니다.
    const { error } = await supabase.from('politicians').insert(payload);
    
    if (error) throw error;

    return NextResponse.json({ success: true, count: payload.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
