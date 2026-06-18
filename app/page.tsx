'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Politician {
  id: string;
  name: string;
  party: string;
  district: string;
  committee: string;
  attendance_rate: number;
  bills_count: number;
  total_asset: number;
  election_count: number;
}

export default function Home() {
  const [politicians, setPoliticians] = useState<Politician[]>([]);
  const [filteredPoliticians, setFilteredPoliticians] = useState<Politician[]>([]);
  const [selectedParty, setSelectedParty] = useState<string>('전체');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 1. Supabase에서 국회의원 데이터 가져오기
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

  // 2. 정당 선택 및 검색어 통합 필터링 시스템 (정당 선택 먹통 해결)
  useEffect(() => {
    let result = politicians;

    if (selectedParty !== '전체') {
      result = result.filter((p) => p.party === selectedParty);
    }

    if (searchTerm.trim() !== '') {
      result = result.filter(
        (p) =>
          p.name.includes(searchTerm) ||
          p.party.includes(searchTerm) ||
          p.district.includes(searchTerm) ||
          p.committee.includes(searchTerm)
      );
    }

    setFilteredPoliticians(result);
  }, [selectedParty, searchTerm, politicians]);

  // 정당 종류 및 카운트 연동 정보
  const parties = [
    { name: '전체', count: politicians.length },
    { name: '국민의힘', count: politicians.filter((p) => p.party === '국민의힘').length },
    { name: '더불어민주당', count: politicians.filter((p) => p.party === '더불어민주당').length },
    { name: '조국혁신당', count: politicians.filter((p) => p.party === '조국혁신당').length },
    { name: '개혁신당', count: politicians.filter((p) => p.party === '개혁신당').length },
    { name: '진보당', count: politicians.filter((p) => p.party === '진보당').length },
  ];

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 p-4 font-sans text-gray-800">
      {/* 정당 선택 레이아웃 */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {parties.map((party) => (
          <button
            key={party.name}
            onClick={() => setSelectedParty(party.name)}
            className={`p-3 rounded-xl border text-center transition-all ${
              selectedParty === party.name
                ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-md'
                : 'bg-white text-gray-700 border-gray-200'
            }`}
          >
            <div className="text-sm">{party.name}</div>
            <div className={`text-xs mt-0.5 ${selectedParty === party.name ? 'text-blue-100' : 'text-blue-600 font-medium'}`}>
              {party.count}명
            </div>
          </button>
        ))}
      </div>

      {/* 검색창 */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="의원 이름, 정당, 지역구 또는 상임위를 입력하세요..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* 뷰 모드 탭 변환 버튼 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode('card')}
          className={`flex-1 p-2 rounded-lg border text-sm font-medium transition-all ${
            viewMode === 'card' ? 'bg-slate-800 text-white' : 'bg-white text-gray-600'
          }`}
        >
          📱 카드 상세 뷰
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`flex-1 p-2 rounded-lg border text-sm font-medium transition-all ${
            viewMode === 'list' ? 'bg-slate-800 text-white' : 'bg-white text-gray-600'
          }`}
        >
          📄 리스트 요약 뷰
        </button>
      </div>

      {/* 메인 데이터 표출 영역 */}
      {viewMode === 'card' ? (
        /* 카드 상세 뷰 (누락 항목 완벽 매핑 완료) */
        <div className="space-y-4">
          {filteredPoliticians.map((p) => (
            <div key={p.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 inline-block mr-1.5">{p.name}</h3>
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">{p.election_count}선</span>
                  <p className="text-xs text-gray-400 mt-0.5">{p.district || '비례대표'}</p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-600 rounded-md">{p.party}</span>
              </div>

              <div className="space-y-2 border-t border-b border-gray-50 py-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-400">소속 상임위</span>
                  <span className="font-medium text-gray-900">{p.committee || '미정'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">본회의 출석률</span>
                  <span className={`font-semibold ${p.attendance_rate > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    {p.attendance_rate > 0 ? `${p.attendance_rate}%` : '정보 없음'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">대표 법안발의</span>
                  <span className="font-medium text-gray-900">{p.bills_count}건</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 text-sm">
                <span className="font-semibold text-blue-900">신고 자산 총액:</span>
                <span className="font-bold text-gray-900">
                  {p.total_asset > 0 ? `${(p.total_asset / 100000000).toLocaleString()} 억원` : '0원'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 리스트 요약 뷰 (요청하신 1인 1행 표(Table) 형식 완벽 구현) */
        <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500">
                <th className="p-3">이름(선수)</th>
                <th className="p-3">정당</th>
                <th className="p-3">지역구</th>
                <th className="p-3">상임위</th>
                <th className="p-3 text-center">출석률</th>
                <th className="p-3 text-center">발의</th>
                <th className="p-3 text-right">자산</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
              {filteredPoliticians.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3 font-bold text-gray-900">
                    {p.name} <span className="text-[10px] font-normal text-gray-400">({p.election_count}선)</span>
                  </td>
                  <td className="p-3 font-medium">{p.party}</td>
                  <td className="p-3 text-gray-500">{p.district || '비례'}</td>
                  <td className="p-3 text-gray-600 font-medium">{p.committee || '미정'}</td>
                  <td className="p-3 text-center font-semibold text-green-600">
                    {p.attendance_rate > 0 ? `${p.attendance_rate}%` : '-'}
                  </td>
                  <td className="p-3 text-center font-medium">{p.bills_count}건</td>
                  <td className="p-3 text-right font-bold text-gray-900">
                    {p.total_asset > 0 ? `${Math.round(p.total_asset / 100000000)}억` : '0원'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
