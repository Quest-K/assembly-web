'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [politicians, setPoliticians] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      // 모든 컬럼을 한 번에 가져옵니다.
      const { data, error } = await supabase
        .from('politicians')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data) {
        setPoliticians(data);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 p-4 font-sans text-gray-800">
      <h1 className="text-xl font-bold mb-4 text-center">대한민국 국회의원 정보</h1>
      
      <div className="space-y-4">
        {politicians.map((p) => (
          <div key={p.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            {/* 이름 및 기본 정보 */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {p.name} <span className="text-sm font-normal text-gray-400">({p.hj_name || '-'})</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{p.district || '비례대표'}</p>
              </div>
              <span className="text-[11px] font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-lg">
                {p.election_count || '초선'}
              </span>
            </div>

            {/* 상세 정보 그리드 */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[12px] text-gray-600 bg-gray-50 p-3 rounded-xl">
              <div className="col-span-2">
                <span className="text-gray-400">생년월일:</span> {p.birth_date || '-'}
              </div>
              <div className="col-span-2">
                <span className="text-gray-400">의원실 전화:</span> {p.office_phone || '-'}
              </div>
              <div className="col-span-2 truncate">
                <span className="text-gray-400">홈페이지:</span> 
                {p.homepage ? (
                  <a href={p.homepage} target="_blank" className="text-blue-500 underline ml-1">{p.homepage}</a>
                ) : ' 없음'}
              </div>
              <div className="col-span-2 text-gray-800 font-medium pt-1 border-t border-gray-200">
                <span className="text-gray-400">보좌관:</span> {p.secretary || '-'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
