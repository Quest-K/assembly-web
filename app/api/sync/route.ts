import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 1. 환경 변수가 제대로 읽히는지 확인하기 위한 변수 할당
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const nationalApiKey = process.env.NATIONAL_ASSEMBLY_API_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // 2. API 키가 비어있는지 먼저 체크
    if (!nationalApiKey) {
      return NextResponse.json({ success: false, message: "국회 API KEY가 설정되지 않았습니다." }, { status: 500 });
    }

    const url = `https://open.assembly.go.kr/portal/openapi/nwvrqwxyaytdsfvhu?KEY=${nationalApiKey}&Type=json&pSize=300`;
    
    const response = await fetch(url);
    const data = await response.json();

    // 3. API 응답 구조를 안전하게 확인 (에러 메시지 로깅)
    const members = data?.nwvrqwxyaytdsfvhu?.[1]?.row;

    if (!members) {
      console.error("API 응답 데이터 구조 오류:", JSON.stringify(data));
      return NextResponse.json({ success: false, message: "데이터를 찾을 수 없습니다." }, { status: 500 });
    }

    // 4. 데이터 저장 로직
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
