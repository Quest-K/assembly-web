'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [politicians, setPoliticians] = useState<any[]>([]);
  const [selectedParty, setSelectedParty] = useState<string>('전체');

  // 1. 데이터 불러오기
  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('politicians').select('*');
      if (data) setPoliticians(data);
    }
    fetchData();
  }, []);

  // 2. 데이터에서 동적으로 정당 목록 생성 (누락 방지)
  const parties = useMemo(() => {
    const pList = Array.from(new Set(politicians.map((p) => p.party || '무소속')));
    return ['전체', ...pList];
  }, [politicians]);

  // 3. 선택된 정당에 따른 데이터 필터링
  const filtered = useMemo(() => {
    return selectedParty === '전체' 
      ? politicians 
      : politicians.filter((p) => (p.party || '무소속') === selectedParty);
  }, [selectedParty, politicians]);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 p-4 font-sans text-gray-800">
      <h1 className="text-xl font-bold mb-4 text-center">대한민국 국회의원 정보</h1>
      
      {/* 정당 선택 필터 */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {parties.map((p) => (
          <button 
            key={p} 
            onClick={() => setSelectedParty(p)}
            className={`p-3 rounded-xl border text-xs font-bold transition-all flex justify-between items-center ${
              selectedParty === p 
                ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                : 'bg-white text-gray-700 border-gray-100 shadow-sm'
            }`}
          >
            <span>{p}</span>
            <span className={selectedParty === p ? 'text-blue-100' : 'text-blue-600'}>
              {politicians.filter((item) => (item.party || '무소속') === p).length}명
            </span>
          </button>
        ))}
      </div>

      {/* 의원 카드 리스트 */}
      <div className="space-y-4">
        {filtered.map((p) => (
          <div key={p.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
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

            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[12px] text-gray-600 bg-gray-50 p-3 rounded-xl">
              <div><span className="text-gray-400">생년월일:</span> {p.birth_date || '-'}</div>
              <div><span className="text-gray-400">전화:</span> {p.office_phone || '-'}</div>
              <div className="col-span-2 truncate">
                <span className="text-gray-400">홈페이지:</span> 
                {p.homepage ? <a href={p.homepage} target="_blank" className="text-blue-500 underline ml-1">바로가기</a> : ' 없음'}
              </div>
              <div className="col-span-2 truncate text-gray-800 font-medium pt-1 border-t border-gray-200">
                <span className="text-gray-400">보좌관:</span> {p.secretary || '-'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
