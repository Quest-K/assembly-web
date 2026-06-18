'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Politician {
  id: string;
  name: string;
  hj_name: string;      // 🟢 추가
  birth_date: string;   // 🟢 추가
  party: string;
  district: string;
  committee: string;
  attendance_rate: number;
  bills_count: number;
  total_asset: number;
  election_count: string; // 🟢 숫자가 아닌 '재선' 등의 텍스트 처리 대응
  homepage: string;     // 🟢 추가
  office_phone: string; // 🟢 추가
  secretary: string;    // 🟢 추가
  secretary2: string;   // 🟢 추가
  asist: string;        // 🟢 추가
}

export default function Home() {
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [filteredPoliticians, setFilteredPoliticians] = useState<Politician[]>([]);
  const [selectedParty, setSelectedParty] = useState<string>('전체');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('politicians')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data) {
        setPoliticians(data);
        setFilteredPoliticians(data);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    let result = politicians || [];
    if (selectedParty !== '전체') result = result.filter((p) => p.party === selectedParty);
    if (searchTerm.trim() !== '') {
      result = result.filter((p) => 
        (p.name?.includes(searchTerm)) || (p.party?.includes(searchTerm)) || 
        (p.district?.includes(searchTerm)) || (p.committee?.includes(searchTerm))
      );
    }
    setFilteredPoliticians(result);
  }, [selectedParty, searchTerm, politicians]);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 p-4 font-sans text-gray-800">
      
      {/* 📊 정당 선택 (생략 가능하므로 상단 기능 유지) */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {['전체', '국민의힘', '더불어민주당', '조국혁신당'].map((p) => (
          <button key={p} onClick={() => setSelectedParty(p)} className={`p-3 rounded-xl border ${selectedParty === p ? 'bg-blue-600 text-white' : 'bg-white'}`}>
            {p}
          </button>
        ))}
      </div>

      {/* 검색 및 뷰 모드 */}
      <input type="text" placeholder="검색..." onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 mb-4 rounded-xl border" />

      {/* 메인 데이터 출력 */}
      {viewMode === 'card' ? (
        <div className="space-y-3">
          {filteredPoliticians.map((p) => (
            <div key={p.id} className="bg-white p-4 rounded-2xl border shadow-sm">
              <div className="mb-2">
                <h3 className="text-lg font-bold">{p.name} <span className="text-sm font-normal text-gray-500">({p.hj_name})</span></h3>
                <p className="text-xs text-gray-400">{p.district} | {p.election_count || '초선'}</p>
              </div>

              {/* 🟢 새로 추가된 상세 정보 영역 */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 bg-gray-50 p-3 rounded-lg mb-3">
                <div>생년월일: {p.birth_date || '-'}</div>
                <div>전화: {p.office_phone || '-'}</div>
                <div className="col-span-2 truncate">홈페이지: <a href={p.homepage} className="text-blue-500 underline" target="_blank">{p.homepage}</a></div>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span>소속 상임위</span><span className="font-semibold">{p.committee}</span></div>
                <div className="flex justify-between"><span>출석률</span><span className="font-bold text-green-600">{p.attendance_rate}%</span></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 리스트 뷰 생략 (필요시 동일 구조로 확장) */
        <div className="text-center p-10 text-gray-400">리스트 뷰 업데이트 대기 중</div>
      )}
    </div>
  );
}
