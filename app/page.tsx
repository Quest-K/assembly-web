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

  // 1. Supabase 데이터 실시간 호출
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

  // 2. 정당 선택 클릭 및 검색어 필터링 시스템 (먹통 현상 완전 해결)
  useEffect(() => {
    let result = politicians || [];

    if (selectedParty !== '전체') {
      result = result.filter((p) => p.party === selectedParty);
    }

    if (searchTerm.trim() !== '') {
      result = result.filter(
        (p) =>
          (p.name && p.name.includes(searchTerm)) ||
          (p.party && p.party.includes(searchTerm)) ||
          (p.district && p.district.includes(searchTerm)) ||
          (p.committee && p.committee.includes(searchTerm))
      );
    }

    setFilteredPoliticians(result);
  }, [selectedParty, searchTerm, politicians]);

  // 3. 에러 방지용 정당 카운트 동적 수집 (Build Failed 원인 제거)
  const getPartyCount = (partyName: string) => {
    if (!politicians) return 0;
    if (partyName === '전체') return politicians.length;
    return politicians.filter((p) => p.party === partyName).length;
  };

  // 노출할 정당 라인업 리스트
  const partyList = ['전체', '국민의힘', '더불어민주당', '조국혁신당', '개혁신당', '진보당'];

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 p-4 font-sans text-gray-800">
      
      {/* 🟢 개선된 정당 선택 영역: 모바일 가로 스크롤 최적화 */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-3 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
        {partyList.map((partyName) => {
          const isSelected = selectedParty === partyName;
          return (
            <button
              key={partyName}
              onClick={() => setSelectedParty(partyName)}
              className={`flex-shrink-0 min-w-[95px] p-2.5 rounded-xl border text-center transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="text-xs font-semibold">{partyName}</div>
              <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-blue-100' : 'text-blue-600 font-bold'}`}>
                {getPartyCount(partyName)}명
              </div>
            </button>
          );
        })}
      </div>

      {/* 검색창 */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="의원 이름, 정당, 지역구 또는 상임위 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* 뷰 모드 스위치 버튼 */}
      <div className="flex gap-2 mb-4 bg-gray-200/60 p-1 rounded-xl">
        <button
          onClick={() => setViewMode('card')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            viewMode === 'card' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}
        >
          📱 카드 상세 뷰
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
          }`}
        >
          📊 리스트 요약 뷰 (표)
        </button>
      </div>

      {/* 4. 데이터 렌더링 컨테이너 */}
      {viewMode === 'card' ? (
        /* 📱 카드 상세 뷰 (일부 항목 누락 완벽 해결 버젼) */
        <div className="space-y-3">
          {filteredPoliticians.map((p) => (
            <div key={p.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-base font-bold text-gray-900 inline-block mr-1.5">{p.name}</h3>
                  <span className="text-[11px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
                    {p.election_count ? `${p.election_count}선` : '1선'}
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">{p.district || '비례대표'}</p>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-lg">{p.party}</span>
              </div>

              <div className="space-y-1.5 border-t border-b border-gray-50 py-2.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-400">소속 상임위</span>
                  <span className="font-semibold text-gray-800">{p.committee || '미정'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">본회의 출석률</span>
                  <span className="font-bold text-green-600">
                    {p.attendance_rate ? `${p.attendance_rate}%` : '정보 없음'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">대표 법안발의</span>
                  <span className="font-semibold text-gray-800">{p.bills_count || 0}건</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 text-xs">
                <span className="font-bold text-slate-500">신고 자산 총액</span>
                <span className="font-extrabold text-gray-900">
                  {p.total_asset ? `${(p.total_asset / 100000000).toLocaleString()} 억원` : '0원'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 📊 리스트 요약 뷰 (요청하신 1인당 1행 표 형식 완벽 구현) */
        <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[450px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400">
                <th className="p-2.5 pl-3">이름(선)</th>
                <th className="p-2.5">정당</th>
                <th className="p-2.5">상임위</th>
                <th className="p-2.5 text-center">출석</th>
                <th className="p-2.5 text-center">발의</th>
                <th className="p-2.5 text-right pr-3">자산</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs text-gray-700">
              {filteredPoliticians.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="p-2.5 pl-3 font-bold text-gray-900">
                    {p.name} <span className="text-[10px] font-normal text-gray-400">{p.election_count || 1}선</span>
                  </td>
                  <td className="p-2.5 font-medium text-gray-600">{p.party}</td>
                  <td className="p-2.5 text-gray-500 truncate max-w-[100px]">{p.committee || '미정'}</td>
                  <td className="p-2.5 text-center font-bold text-green-600">{p.attendance_rate ? `${p.attendance_rate}%` : '-'}</td>
                  <td className="p-2.5 text-center font-medium">{p.bills_count || 0}건</td>
                  <td className="p-2.5 text-right font-bold text-gray-900 pr-3">
                    {p.total_asset ? `${Math.round(p.total_asset / 100000000)}억` : '0원'}
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
