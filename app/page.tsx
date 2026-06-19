'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function Home() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('politicians').select('*');
      if (data) setData(data);
    }
    load();
  }, []);

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-50 min-h-screen space-y-4">
      {data.map((p) => (
        <div key={p.id} className="bg-white p-5 rounded-2xl border shadow-sm">
          <h3 className="font-bold text-lg">{p.name} <span className="text-sm text-gray-400">({p.hj_name})</span></h3>
          <p className="text-xs text-blue-600 mb-2">{p.party} | {p.district}</p>
          <div className="text-[11px] text-gray-700 space-y-1 bg-gray-50 p-3 rounded-lg">
            <p>생년월일: {p.birth_date}</p>
            <p>상임위: {p.committee}</p>
            <p>전화: {p.office_phone}</p>
            <p>보좌진: {p.secretary}, {p.secretary2}, {p.asist}</p>
            <p className="truncate">홈페이지: {p.homepage}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
