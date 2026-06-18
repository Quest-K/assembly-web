"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase 실시간 연동 설정
const SUPABASE_URL = 'https://lnjduracoquhlebzxefb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInVybCI6Imh0dHBzOi8vbG5qZHVyYWNvcXVo bGVienhlZmIuc3VwYWJhc2UuY28iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc0MDQwMDQ5MiwiZXhwIjoyMDU2MDAwNDkyfQ.oR_06HkY_Uvbe_f8Y5Cny_Vw_0iX68AEx-w53X4eOEQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function Home() {
  // 💡 데이터 타입을 any[]로 명시하여 never[] 빌드 차단 에러를 완벽하게 방어합니다.
  const [politicians, setPoliticians] = useState<any[]>([]);
  const [viewType, setViewType] = useState<'card' | 'list'>('card');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Supabase에서 국회의원 전체 데이터를 가져옵니다.
        const { data, error } = await supabase
          .from('politicians')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;
        if (data) {
          setPoliticians(data);
        }
      } catch (err: any) {
        console.error('Supabase 연동 오류:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 검색어 필터링 로직 (의원 이름, 정당, 지역구명 검색 가능)
  const filteredPoliticians = politicians.filter((p) => {
    const nameMatch = p.name ? p.name.includes(searchTerm) : false;
    const districtMatch = p.district ? p.district.includes(searchTerm) : false;
    const partyMatch = p.party ? p.party.includes(searchTerm) : false;
    return nameMatch || districtMatch || partyMatch;
  });

  // 📊 실시간 정당 리스트 및 정당별 인원수 자동 계산
  const partyStats = politicians.reduce((acc: any, curr: any) => {
    const partyName = curr.party || '무소속';
    if (!acc[partyName]) {
      acc[partyName] = 0;
    }
    acc[partyName] += 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 text-gray-500 font-medium">
        실시간 데이터베이스 연동 중...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      {/* 대시보드 타이틀 배너 */}
      <div className="bg-blue-950 text-white py-10 px-4 shadow-sm mb-8 text-center md:text-left">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-extrabold flex items-center justify-center md:justify-start gap-2">
            🏛️ 취재시작 (Start-Chwijae)
          </h1>
          <p className="text-blue-200 text-sm mt-2 font-medium">
            내 Supabase DB와 실시간 연동된 대한민국 국회의원 대시보드
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 space-y-8">
        
        {/* 요청사항: 정당 리스트 및 각 정당별 인원수 현황판 */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">📊 정당별 요약 현황</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Object.keys(partyStats).map((party) => {
              const count = partyStats[party];
              return (
                <div key={party} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center hover:shadow-sm transition-all">
                  <span className="font-bold text-gray-800">{party}</span>
                  <span className="text-sm font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">{count}명</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 컨트롤바: 검색 및 카드/리스트 토글 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="의원 이름, 정당 또는 지역구를 입력하세요..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 shadow-sm transition-all"
            />
          </div>
          
          <div className="flex gap-2 self-end md:self-auto">
            <button
              onClick={() => setViewType('card')}
              className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all ${
                viewType === 'card' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}
            >
              📱 카드 뷰
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all ${
                viewType === 'list' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}
            >
              📑 리스트 뷰
            </button>
          </div>
        </div>

        {/* 국회의원 데이터 목록 표시 구역 */}
        {filteredPoliticians.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">데이터를 불러오는 중이거나 검색 결과가 없습니다.</div>
        ) : viewType === 'card' ? (
          /* ────────── 카드형 뷰 ────────── */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPoliticians.map((p) => (
              <div key={p.id} className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:border-blue-200 hover:shadow-md transition-all">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{p.name}</h3>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold">{p.party || '무소속'}</span>
                  </div>
                  
                  <div className="space-y-1.5 text-sm text-gray-600 border-b pb-3 mb-3">
                    <p><span className="text-gray-400 font-medium">지역구:</span> {p.district || '정보 없음'}</p>
                    <p><span className="text-gray-400 font-medium">상임위:</span> {p.committee || '미정'}</p>
                    <p><span className="text-gray-400 font-medium">생년월일:</span> {p.birth_date || '미등록'}</p>
                    <p><span className="text-gray-400 font-medium">선수(당선):</span> {p.election_count ? `${p.election_count}선` : '초선'}</p>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-blue-900 bg-blue-50/50 p-2 rounded-lg flex justify-between">
                    <span>신고 자산:</span>
                    <span>{p.assets ? `${(Number(p.assets) / 10000).toLocaleString()} 억 원` : '0원'}</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-3 truncate">{p.email}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ────────── 줄/리스트형 뷰 ────────── */
          <div className="space-y-2 bg-white p-4 rounded-2xl border shadow-sm">
            <div className="hidden md:flex items-center justify-between p-2.5 bg-gray-50 rounded-xl font-bold text-gray-500 text-xs px-6">
              <span className="w-2/12">의원명</span>
              <span className="w-2/12">정당</span>
              <span className="w-2/12">지역구</span>
              <span className="w-2/12">당선횟수</span>
              <span className="w-4/12">신고 자산</span>
            </div>
            {filteredPoliticians.map((p) => (
              <div key={p.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 transition-all px-6 text-sm gap-1 md:gap-0">
                <span className="w-2/12 font-bold text-gray-900">{p.name}</span>
                <span className="w-2/12 text-gray-700">{p.party || '무소속'}</span>
                <span className="w-2/12 text-gray-600">{p.district || '비례/기타'}</span>
                <span className="w-2/12 text-xs text-gray-500">{p.election_count ? `${p.election_count}선` : '초선'}</span>
                <span className="w-4/12 font-semibold text-blue-950">{p.assets ? `${(Number(p.assets) / 10000).toLocaleString()} 억 원` : '0원'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
