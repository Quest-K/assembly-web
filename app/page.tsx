"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase 실시간 보안 세션 연동
const SUPABASE_URL = 'https://lnjduracoquhlebzxefb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInVybCI6Imh0dHBzOi8vbG5qZHVyYWNvcXVo bGVienhlZmIuc3VwYWJhc2UuY28iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc0MDQwMDQ5MiwiZXhwIjoyMDU2MDAwNDkyfQ.oR_06HkY_Uvbe_f8Y5Cny_Vw_0iX68AEx-w53X4eOEQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 7개 행정구역 분류 로직
const getRegionGroup = (districtName: string) => {
  if (!districtName || districtName.includes('비례')) return '비례/기타';
  if (districtName.startsWith('서울')) return '서울';
  if (districtName.startsWith('경기') || districtName.startsWith('인천')) return '경기';
  if (districtName.startsWith('강원')) return '강원';
  if (districtName.startsWith('충청') || districtName.startsWith('대전') || districtName.startsWith('세종') || districtName.startsWith('충북') || districtName.startsWith('충남')) return '충청';
  if (districtName.startsWith('전라') || districtName.startsWith('광주') || districtName.startsWith('전북') || districtName.startsWith('전남')) return '전라';
  if (districtName.startsWith('경상') || districtName.startsWith('부산') || districtName.startsWith('대구') || districtName.startsWith('울산') || districtName.startsWith('경북') || districtName.startsWith('경남')) return '경상';
  if (districtName.startsWith('제주')) return '제주';
  return '비례/기타';
};

export default function Home() {
  // 🔥 핵심 해결선언: Vercel 빌드 차단 원인이었던 never[] 타입을 임의의 객체 배열(any[])로 명시적 선언
  const [politicians, setPoliticians] = useState<any[]>([]);
  const [viewType, setViewType] = useState<'card' | 'list'>('card');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('전체');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Supabase 인프라 설계 필드 호출 구조 매핑
        const { data, error } = await supabase
          .from('politicians')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;
        
        // 데이터 저장 단계 에러 컷오프 패치 적용
        if (data) {
          setPoliticians(data);
        }
      } catch (err: any) {
        console.error('Supabase 연동 실패:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 검색어 및 선택 권역에 따른 목록 필터링
  const filteredPoliticians = politicians.filter((p) => {
    const nameMatch = p.name ? p.name.includes(searchTerm) : false;
    const districtMatch = p.district ? p.district.includes(searchTerm) : false;
    const partyMatch = p.party ? p.party.includes(searchTerm) : false;
    const matchesSearch = nameMatch || districtMatch || partyMatch;

    if (selectedRegion === '전체') return matchesSearch;
    return matchesSearch && getRegionGroup(p.district || '') === selectedRegion;
  });

  // 정당별 통계 요약 가공 (인원 수 및 평균 자산)
  const partyStats = politicians.reduce((acc: any, curr: any) => {
    const partyName = curr.party || '무소속';
    const assetVal = Number(curr.assets) || 0;

    if (!acc[partyName]) {
      acc[partyName] = { count: 0, totalAsset: 0 };
    }
    acc[partyName].count += 1;
    acc[partyName].totalAsset += assetVal;
    return acc;
  }, {});

  // 7개 권역별 정당 분포 가공
  const regionStats = politicians.reduce((acc: any, curr: any) => {
    const region = getRegionGroup(curr.district || '');
    const partyName = curr.party || '무소속';

    if (!acc[region]) acc[region] = {};
    if (!acc[region][partyName]) acc[region][partyName] = 0;

    acc[region][partyName] += 1;
    return acc;
  }, {});

  const regionsList = ['서울', '경기', '강원', '충청', '전라', '경상', '제주'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 text-gray-500 font-medium">
        실시간 DB 연동 인프라 로드 중...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      {/* 타이틀 대시보드 */}
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
        
        {/* 통계 섹션: 정당별 총원 및 평균 자산 */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">📊 정당별 요약 현황</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.keys(partyStats).map((party) => {
              const count = partyStats[party].count;
              const avgAsset = Math.round(partyStats[party].totalAsset / count);
              return (
                <div key={party} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition-all">
                  <div className="font-bold text-gray-800 text-base mb-2 border-b pb-1 flex justify-between items-center">
                    <span>{party}</span>
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{count}명</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    평균 자산: <span className="font-semibold text-gray-900">{avgAsset > 0 ? `${avgAsset.toLocaleString()}만 원` : '0원'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 7개 권역별 분포 컨트롤 패널 */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">🗺️ 7개 권역별 정당 분포 현황</h2>
          <p className="text-xs text-gray-400 mb-4">지역을 클릭하면 아래 국회의원 목록이 해당 권역 데이터로 필터링됩니다.</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
            <button
              onClick={() => setSelectedRegion('전체')}
              className={`p-3 rounded-xl border text-sm font-semibold transition-all ${
                selectedRegion === '전체' ? 'bg-blue-900 text-white border-blue-900 shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              🗺️ 전체보기
            </button>
            {regionsList.map((reg) => {
              const partyData = regionStats[reg] || {};
              return (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    selectedRegion === reg ? 'bg-blue-900 text-white border-blue-900 shadow-md scale-[1.02]' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-sm font-bold">{reg}</span>
                  <div className="text-[10px] mt-1 space-y-0.5 opacity-90">
                    {Object.keys(partyData).slice(0, 2).map((party) => (
                      <div key={party} className="truncate">
                        {party.slice(0,4)}: {partyData[party]}명
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 필터 및 레이아웃 토글바 */}
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

        {/* 국회의원 리스트 데이터 매핑 아웃풋 영역 */}
        {filteredPoliticians.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">조건에 맞는 국회의원 데이터가 없습니다.</div>
        ) : viewType === 'card' ? (
          /* Card View 인터페이스 */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPoliticians.map((p) => (
              <div key={p.id} className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:border-blue-200 hover:shadow-md transition-all">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{p.name}</h3>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold">{p.party || '무소속'}</span>
                  </div>
                  
                  <div className="space-y-1.5 text-sm text-gray-600 border-b pb-3 mb-3">
                    <p><span className="text-gray-400 font-medium">지역구:</span> {p.district}</p>
                    <p><span className="text-gray-400 font-medium">상임위:</span> {p.committee || '미정'}</p>
                    <p><span className="text-gray-400 font-medium">생년월일:</span> {p.birth_date || '미등록'}</p>
                    <p><span className="text-gray-400 font-medium">선수(당선):</span> {p.is_reelected ? `연임 (${p.election_count}선)` : `초선 (${p.election_count}선)`}</p>
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
          /* List View 인터페이스 */
          <div className="space-y-2 bg-white p-4 rounded-2xl border shadow-sm">
            <div className="hidden md:flex items-center justify-between p-2.5 bg-gray-50 rounded-xl font-bold text-gray-500 text-xs px-6">
              <span className="w-1/12">의원명</span>
              <span className="w-2/12">정당</span>
              <span className="w-2/12">지역구</span>
              <span className="w-2/12">당선횟수</span>
              <span className="w-3/12">신고 자산</span>
              <span className="w-2/12">생년월일</span>
            </div>
            {filteredPoliticians.map((p) => (
              <div key={p.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 transition-all px-6 text-sm gap-1 md:gap-0">
                <span className="w-1/12 font-bold text-gray-900">{p.name}</span>
                <span className="w-2/12 text-gray-700">{p.party || '무소속'}</span>
                <span className="w-2/12 text-gray-600">{p.district}</span>
                <span className="w-2/12 text-xs text-gray-500">{p.election_count ? `${p.election_count}선` : '초선'}</span>
                <span className="w-3/12 font-semibold text-blue-950">{p.assets ? `${(Number(p.assets) / 10000).toLocaleString()} 억 원` : '0원'}</span>
                <span className="w-2/12 text-xs text-gray-400">{p.birth_date || '-'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
