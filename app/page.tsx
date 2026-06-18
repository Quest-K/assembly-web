"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase 인프라 초기화
const SUPABASE_URL = 'https://lnjduracoquhlebzxefb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInVybCI6Imh0dHBzOi8vbG5qZHVyYWNvcXVo bGVienxlZmIuc3VwYWJhc2UuY28iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc0MDQwMDQ5MiwiZXhwIjoyMDU2MDAwNDkyfQ.oR_06HkY_Uvbe_f8Y5Cny_Vw_0iX68AEx-w53X4eOEQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function Home() {
  const [politicians, setPoliticians] = useState<any>([]);
  const [viewType, setViewType] = useState<string>('card');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 🔍 실시간 모니터링을 위한 상태 필드 추가
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
        
        // Supabase에서 politicians 테이블 레코드 전체를 긁어옵니다.
        const { data, error } = await supabase
          .from('politicians')
          .select('*')
          .order('name', { ascending: true });

        // 🚨 DB 에러 트래킹 채널 오픈
        if (error) {
          setDebugSteps(prev => [...prev, '❌ 3단계 실패: Supabase SQL 호출 과정에서 에러 감지']);
          throw error;
        }
        
        if (data) {
          if (data.length === 0) {
            setDebugSteps(prev => [...prev, '⚠️ 3단계 경고: 서버 연결은 되었으나 테이블에 데이터가 0건입니다 (빈 테이블)']);
          } else {
            setDebugSteps(prev => [...prev, `✅ 3단계 성공: 서버 동기화 완료 (수신된 데이터: ${data.length}건)`]);
          }
          setPoliticians(data);
        } else {
          setDebugSteps(prev => [...prev, '⚠️ 3단계 경고: 응답 데이터(data) 객체가 비어있습니다.']);
        }
      } catch (err: any) {
        console.error('DB 통신 실패:', err.message);
        // 화면에 에러 원인 코드 및 상세 메시지 바인딩
        setErrorMessage(`[에러 감지] 코드: ${err.code || '알수없음'} / 메시지: ${err.message || '네트워크나 키 오류 가능성'}`);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 실시간 타이핑 검색 필터링 구조
  const filteredPoliticians = (politicians || []).filter((p: any) => {
    const nameMatch = p.name ? p.name.includes(searchTerm) : false;
    const districtMatch = p.district ? p.district.includes(searchTerm) : false;
    const partyMatch = p.party ? p.party.includes(searchTerm) : false;
    return nameMatch || districtMatch || partyMatch;
  });

  // 📊 실시간 정당 리스트 및 인원수 카운팅 집계 계산
  const partyStats = (politicians || []).reduce((acc: any, curr: any) => {
    const partyName = curr.party || '무소속';
    if (!acc[partyName]) acc[partyName] = 0;
    acc[partyName] += 1;
    return acc;
  }, {});

  return (
    <main className="min-h-screen bg-gray-50 pb-12">
      {/* 대시보드 메인 헤더 배너 */}
      <div className="bg-blue-950 text-white py-10 px-4 shadow-sm mb-8 text-center md:text-left">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-extrabold">🏛️ 취재시작 (Start-Chwijae)</h1>
          <p className="text-blue-200 text-sm mt-2 font-medium">
            내 Supabase DB와 실시간 연동된 대한민국 국회의원 대시보드
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 space-y-6">
        
        {/* 🚨 실시간 인프라 진단 및 에러 모니터링 현황판 (모바일 디버깅용) */}
        <section className="bg-slate-900 text-slate-200 p-5 rounded-2xl shadow-md border border-slate-800">
          <h2 className="text-sm font-mono tracking-wider uppercase font-bold text-emerald-400 mb-3 flex items-center gap-2">
            ⚡ 실시간 인프라 파이프라인 진단 시스템
          </h2>
          <div className="space-y-1.5 font-mono text-xs">
            {debugSteps.map((step, idx) => (
              <p key={idx} className="border-l-2 border-emerald-500/30 pl-3 py-0.5">{step}</p>
            ))}
            
            {/* 데이터 로딩 상태 바 */}
            {loading && (
              <p className="text-amber-400 animate-pulse pl-3 border-l-2 border-amber-500/30">🔄 현재 실시간 동기화 응답을 대기하고 있습니다...</p>
            )}

            {/* 에러가 발생했을 경우 화면에 강제 경고창 출력 */}
            {errorMessage && (
              <div className="mt-4 p-4 bg-red-950/80 border border-red-800 text-red-200 rounded-xl space-y-1">
                <p className="font-bold text-red-400 text-sm">🛑 백엔드 연동 장애 발생</p>
                <p className="text-xs break-all whitespace-pre-wrap">{errorMessage}</p>
                <p className="text-[10px] text-red-400/70 mt-2 font-sans">💡 팁: RLS 정책 미설정, Supabase URL/KEY 오타, 혹은 테이블명이 politicians가 맞는지 확인이 필요합니다.</p>
              </div>
            )}
          </div>
        </section>

        {/* 현황판 섹션: 실시간 정당 목록 및 의원 수 */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">📊 정당별 요약 현황</h2>
          {Object.keys(partyStats).length === 0 ? (
            <p className="text-xs text-gray-400">연동된 정당 데이터가 존재하지 않습니다.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Object.keys(partyStats).map((party) => (
                <div key={party} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-between items-center hover:shadow-sm transition-all">
                  <span className="font-bold text-gray-800">{party}</span>
                  <span className="text-sm font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                    {partyStats[party]}명
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 검색 및 뷰 모드 조작 바 */}
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

        {/* 메인 데이터 바인딩 아웃풋 영역 */}
        {filteredPoliticians.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-2xl border">
            {!loading && !errorMessage ? "🎉 DB와 연결은 성공했으나, 출력할 데이터 조건이 없거나 비어있습니다." : "현재 인프라 검증 파이프라인 진행 중..."}
          </div>
        ) : viewType === 'card' ? (
          /* 카드 디자인 뷰포트 */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPoliticians.map((p: any) => (
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
                    <p><span className="text-gray-400 font-medium">선수:</span> {p.election_count ? `${p.election_count}선` : '초선'}</p>
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
          /* 한 줄 리스트 디자인 뷰포트 */
          <div className="space-y-2 bg-white p-4 rounded-2xl border shadow-sm">
            <div className="hidden md:flex items-center justify-between p-2.5 bg-gray-50 rounded-xl font-bold text-gray-500 text-xs px-6">
              <span className="w-2/12">의원명</span>
              <span className="w-2/12">정당</span>
              <span className="w-2/12">지역구</span>
              <span className="w-2/12">당선횟수</span>
              <span className="w-4/12">신고 자산</span>
            </div>
            {filteredPoliticians.map((p: any) => (
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
