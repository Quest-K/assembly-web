'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [politicians, setPoliticians] = useState<any[]>([]);
  const [selectedParty, setSelectedParty] = useState<string>('전체');

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('politicians').select('*');
      if (data) setPoliticians(data);
    }
    fetchData();
  }, []);

  // 정당별 인원수 계산 (공백 제거 후 비교로 오류 방지)
  const getPartyCount = (partyName: string) => {
    if (partyName === '전체') return politicians.length;
    return politicians.filter((p) => p.party?.trim() === partyName.trim()).length;
  };

  const filtered = selectedParty === '전체' 
    ? politicians 
    : politicians.filter((p) => p.party?.trim() === selectedParty.trim());

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 p-4 font-sans text-gray-800">
      {/* 정당 필터링 */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {['전체', '국민의힘', '더불어민주당', '조국혁신당'].map((p) => (
          <button 
            key={p} 
            onClick={() => setSelectedParty(p)}
            className={`p-3 rounded-xl border flex justify-between ${selectedParty === p ? 'bg-blue-600 text-white' : 'bg-white'}`}
          >
            <span>{p}</span>
            <span className="font-bold">{getPartyCount(p)}명</span>
          </button>
        ))}
      </div>

      {/* 의원 목록 */}
      <div className="space-y-3">
        {filtered.map((p) => (
          <div key={p.id} className="bg-white p-4 rounded-2xl border shadow-sm">
            <h3 className="text-lg font-bold">{p.name} <span className="text-xs text-gray-400">({p.hj_name || '-'})</span></h3>
            <p className="text-xs text-gray-500 mb-3">{p.district || '비례대표'} | {p.election_count || '초선'}</p>
            
            <div className="text-[11px] text-gray-600 bg-gray-50 p-3 rounded-lg grid grid-cols-2 gap-2">
              <p>생년월일: {p.birth_date || '-'}</p>
              <p>전화: {p.office_phone || '-'}</p>
              <p className="col-span-2 truncate">홈페이지: {p.homepage || '없음'}</p>
              <p className="col-span-2 truncate">보좌관: {p.secretary || '-'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
