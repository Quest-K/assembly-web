import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const apiKey = process.env.NATIONAL_ASSEMBLY_API_KEY;
  const url = `https://open.assembly.go.kr/portal/openapi/nwvrqwxyaytdsfvhu?KEY=${apiKey}&Type=json&pSize=300`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    const members = data?.nwvrqwxyaytdsfvhu?.[1]?.row;

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

    const { error } = await supabase.from('politicians').insert(payload);
    
    if (error) throw error;

    return NextResponse.json({ success: true, count: payload.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
