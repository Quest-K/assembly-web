import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const apiKey = process.env.NATIONAL_ASSEMBLY_API_KEY;
    if (!apiKey) throw new Error("환경변수 NATIONAL_ASSEMBLY_API_KEY가 없습니다.");

    // 공공데이터포털 API 호출 (pSize=300으로 전체 데이터 요청)
    const url = `https://open.assembly.go.kr/portal/openapi/nwvrqwxyaytdsfvhu?KEY=${apiKey}&Type=json&pSize=300`;
    const res = await fetch(url);
    const data = await res.json();
    
    // API 데이터 구조 추출
    const members = data?.nwvrqwxyaytdsfvhu?.[1]?.row;
    if (!members) throw new Error('API 데이터를 가져오지 못했습니다.');

    // 데이터 저장 프로세스
    for (const m of members) {
      const { error } = await supabase.from('politicians').upsert({
        name: m.HG_NM,                // 1. 이름
        hj_name: m.HJ_NM || null,     // 2. 한자명
        eng_name: m.ENG_NM || null,   // 3. 영문명칭
        bth_gbn: m.BTH_GBN_NM || null,// 4. 음/양력
        birth_date: m.BTH_DATE || null,// 5. 생년월일
        job_res: m.JOB_RES_NM || null,// 6. 직책명
        party: m.POLY_NM || null,     // 7. 정당명
        district: m.ORIG_NM || null,  // 8. 선거구
        elect_gbn: m.ELECT_GBN_NM || null, // 9. 선거구구분
        committee: m.CMIT_NM || null, // 10. 대표 위원회
        committees: m.CMITS || null,  // 11. 소속 위원회 목록
        reele_gbn: m.REELE_GBN_NM || null, // 12. 재선
        units: m.UNITS || null,       // 13. 당선
        sex: m.SEX_GBN_NM || null,    // 14. 성별
        tel: m.TEL_NO || null,        // 15. 전화번호
        email: m.E_MAIL || null,      // 16. 이메일
        homepage: m.HOMEPAGE || null, // 17. 홈페이지
        staff: m.STAFF || null,       // 18. 보좌관
        secretary: m.SECRETARY || null, // 19. 선임비서관
        secretary2: m.SECRETARY2 || null, // 20. 비서관
        mona_cd: m.MONA_CD || null,   // 21. 국회의원코드
        mem_title: m.MEM_TITLE || null, // 22. 약력
        assem_addr: m.ASSEM_ADDR || null // 23. 사무실 호실
      }, { onConflict: 'name' });

      if (error) {
        console.error(`데이터 저장 실패 (${m.HG_NM}):`, error);
      }
    }

    return NextResponse.json({ success: true, count: members.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
