"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lnjduracoqurhlbzxefb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuamR1cmFjb3F1cmhsYnp4ZWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MDMwNjgsImV4cCI6MjA5NzI3OTA2OH0.9FM8_VhfEusohvG6JGvss36m10BRj3nCP5qtJk0SWM8';

const cleanUrl = SUPABASE_URL.replace(/\s/g, '');
const cleanKey = SUPABASE_KEY.replace(/\s/g, '');
const supabase = createClient(cleanUrl, cleanKey);

export default function Home() {
  const [politicians, setPoliticians] = useState<any[]>([]);
  const [viewType, setViewType] = useState<string>('list'); 
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [debugSteps, setDebugSteps] = useState<string[]>([
    '⏳ 1단계: 브라우저 렌더링 시작 및 인프라 대기 중...'
  ]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setErrorMessage(null);
        
        setDebugSteps(prev => [...prev, '🔌 2단계: Supabase 원격 서버 접속 시도 중...']);
        
        const { data, error } = await supabase
          .from('politicians')
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          setDebugSteps(prev => [...prev, '❌ 3단계 실패: Supabase SQL 호출 과정에서 에러 감지']);
          throw error;
        }
        
        if (data) {
          setDebugSteps(prev => [...prev, `✅ 3단계 성공: 서버 동기화 완료 (수신 데이터: ${data.length}건)`]);
          setPoliticians(data);
        }
      } catch (err: any) {
        console.error('DB 통신 실패:', err.message);
        setErrorMessage(`[에러 감지] 메시지: ${err.message || '네트워크 단절 및 토큰 불일치'}`);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredPoliticians = (politicians || []).filter((p: any) => {
    const nameMatch = p.name ? p.name.includes(searchTerm) : false;
    const districtMatch = p.district ? p.district.includes(searchTerm) : false;
    const partyMatch = p.party ? p.party.includes(searchTerm) : false;
    const committeeMatch = p.committee ? p.committee.includes(searchTerm) : false;
    return nameMatch || districtMatch || partyMatch || committeeMatch;
  });

  const partyStats = (politicians || []).reduce((acc: any, curr: any) => {
    const partyName = curr.party || '무소속';
    if (!acc[partyName]) acc[partyName] = 0;
    acc[partyName] += 1;
    return acc;
  }, {});

  // 자산 데이터 포맷 변환 함수
  const renderAsset = (p: any) => {
    const assetValue = p.total_asset !== undefined && p.total_asset !== null ? p.total_asset : p.assets;
    if (!assetValue || Number(assetValue) === 0) return '0원';
    return `${(Number(assetValue) / 10000).toLocaleString()} 억 원`;
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-blue-950 text-white py-10 px-4 shadow-sm mb-8 text-center md:text-left">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-extrabold">🏛️ 취재시작 (Start-Chwijae)</h1>
          <p className="text-blue-200 text-sm mt-2 font-medium">대한민국 국회의원 의정활동 및 자산 실시간 대시보드</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 space-y-6">
        
        {/* 진단 패널 */}
        <section className="bg-slate-900 text-slate-200 p-5 rounded-2xl shadow-md border border-slate-800">
          <h2 className="text-sm font-mono tracking-wider uppercase font-bold text-emerald-400 mb-3 flex items-center gap-2">
            ⚡ 실시간 인프라 파이프라인 진단 시스템
          </h2>
          <div className="space-y-1.5 font-mono text-xs">
            {debugSteps.map((step, idx) => (
              <p key={idx} className="border-l-2 border-emerald-500/30 pl-3 py-0.5">{step}</p>
            ))}
            {loading && <p className="text-amber-400 animate-pulse pl-3">🔄 데이터 응답을 기다리는 중...</p>}
            {errorMessage && (
              <div className="mt-4 p-4 bg-red-950/80 border border-red-800 text-red-200 rounded-xl">
                <p className="font-bold text-red-400 text-sm">🛑 백엔드 연동 장애 발생</p>
                <p className="text-xs break-all whitespace-pre-wrap">{errorMessage}</p>
              </div>
            )}
          </div>
        </section>

        {/* 정당 현황 */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">📊 정당별 요약 현황</h2>
          {Object.keys(partyStats).length === 0 ? (
            <p className="text-xs text-gray-400">연동된 정당 데이터가 존재하지 않습니다.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Object.keys(partyStats).map((party) => (
                <div key={party} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-gray-800">{party}</span>
                  <span className="text-sm font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">{partyStats[party]}명</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 검색 및 제어 바 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4">
          <input
            type="text"
            placeholder="의원 이름, 정당, 지역구 또는 상임위를 입력하세요..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm"
          />
          <div className="flex gap-2">
            <button onClick={() => setViewType('card')} className={`px-4 py-2 rounded-xl text-xs font-bold ${viewType === 'card' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border'}`}>📱 카드 상세 뷰</button>
            <button onClick={() => setViewType('list')} className={`px-4 py-2 rounded-xl text-xs font-bold ${viewType === 'list' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border'}`}>📑 리스트 요약 뷰</button>
          </div>
        </div>

        {/* 메인 데이터 테이블 렌더링 파트 */}
        {filteredPoliticians.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-2xl border">
            {!loading && !errorMessage ? "데이터베이스가 비어있거나 검색 조건에 일치하는 결과가 없습니다." : "데이터 파이프라인 가동 중..."}
          </div>
        ) : viewType === 'card' ? (
          /* ================= [1] 카드 뷰 레이아웃 고도화 ================= */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPoliticians.map((p: any) => (
              <div key={p.id} className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        {p.name}
                        {/* 🏛️ election_count 컬럼 반영 */}
                        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          {p.election_count ? `${p.election_count}선` : '초선'}
                        </span>
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">{p.district || '비례대표'}</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold">{p.party || '무소속'}</span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 border-b pb-4 mb-4 bg-gray-50/50 p-3 rounded-xl">
                    {/* 🏛️ committee 컬럼 반영 */}
                    <p className="flex justify-between"><span className="text-gray-400">소속 상임위</span> <span className="font-medium text-gray-800">{p.committee || '미정'}</span></p>
                    {/* 🏛️ attendance_rate 컬럼 반영 */}
                    <p className="flex justify-between"><span className="text-gray-400">본회의 출석률</span> <span className="font-bold text-emerald-600">{p.attendance_rate ? `${p.attendance_rate}%` : '정보 없음'}</span></p>
                    {/* 🏛️ bills_count 컬럼 반영 */}
                    <p className="flex justify-between"><span className="text-gray-400">대표 법안발의</span> <span className="font-bold text-blue-600">{p.bills_count ? `${p.bills_count}건` : '0건'}</span></p>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-blue-900 bg-blue-50/50 p-2.5 rounded-lg flex justify-between">
                    <span>신고 자산 총액:</span>
                    <span>{renderAsset(p)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ================= [2] 리스트 뷰 레이아웃 고도화 ================= */
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            {/* 테이블 헤더 컬럼 구조 정의 */}
            <div className="hidden md:flex justify-between p-4 bg-gray-100 text-xs font-bold text-gray-500 border-b text-center">
              <span className="w-20">이름(선수)</span>
              <span className="w-24">소속 정당</span>
              <span className="flex-1 text-left px-4">지역구</span>
              <span className="w-40">소속 상임위</span>
              <span className="w-20">출석률</span>
              <span className="w-20">발의건수</span>
              <span className="w-32 text-right">신고자산</span>
            </div>
            
            <div className="divide-y divide-gray-100">
              {filteredPoliticians.map((p: any) => (
                <div key={p.id} className="flex flex-col md:flex-row justify-between p-4 hover:bg-gray-50/50 text-sm items-center text-center gap-2 md:gap-0">
                  {/* 이름 + 선수 */}
                  <div className="w-full md:w-20 font-bold text-gray-900 flex items-center justify-center md:justify-start gap-1">
                    {p.name}
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1 rounded font-normal">
                      {p.election_count ? `${p.election_count}선` : '1선'}
                    </span>
                  </div>
                  
                  {/* 정당 */}
                  <span className="w-full md:w-24 text-gray-700 bg-gray-50 md:bg-transparent py-1 md:py-0 rounded font-medium">{p.party || '무소속'}</span>
                  
                  {/* 지역구 */}
                  <span className="w-full md:flex-1 text-gray-500 md:text-left md:px-4 text-xs md:text-sm">{p.district || '비례대표'}</span>
                  
                  {/* 상임위원회 */}
                  <span className="w-full md:w-40 text-gray-600 font-medium truncate text-xs md:text-sm">{p.committee || '미정'}</span>
                  
                  {/* 출석률 */}
                  <span className="w-full md:w-20 font-bold text-emerald-600 text-xs md:text-sm">
                    <span className="md:hidden text-gray-400 font-normal mr-1">출석률:</span>
                    {p.attendance_rate ? `${p.attendance_rate}%` : '-'}
                  </span>
                  
                  {/* 법안 발의 수 */}
                  <span className="w-full md:w-20 font-semibold text-blue-600 text-xs md:text-sm">
                    <span className="md:hidden text-gray-400 font-normal mr-1">발의건수:</span>
                    {p.bills_count ? `${p.bills_count}건` : '0건'}
                  </span>
                  
                  {/* 자산 */}
                  <span className="w-full md:w-32 font-bold text-blue-950 text-center md:text-right text-xs md:text-sm bg-blue-50/30 md:bg-transparent p-1.5 md:p-0 rounded">
                    <span className="md:hidden text-gray-400 font-normal mr-1">자산:</span>
                    {renderAsset(p)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
