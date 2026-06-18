"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// 🏛️ 대표님이 Supabase에서 직접 복사하신 100% 검증된 진짜 URL과 KEY입니다.
const SUPABASE_URL = 'https://lnjduracoqurhlbzxefb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuamR1cmFjb3F1cmhsYnp4ZWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MDMwNjgsImV4cCI6MjA5NzI3OTA2OH0.9FM8_VhfEusohvG6JGvss36m10BRj3nCP5qtJk0SWM8';

const cleanUrl = SUPABASE_URL.replace(/\s/g, '');
const cleanKey = SUPABASE_KEY.replace(/\s/g, '');
const supabase = createClient(cleanUrl, cleanKey);

export default function Home() {
  const [politicians, setPoliticians] = useState<any[]>([]);
  const [viewType, setViewType] = useState<string>('list'); // 기본 뷰를 깔끔한 리스트뷰로 지정
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
    return nameMatch || districtMatch || partyMatch;
  });

  const partyStats = (politicians || []).reduce((acc: any, curr: any) => {
    const partyName = curr.party || '무소속';
    if (!acc[partyName]) acc[partyName] = 0;
    acc[partyName] += 1;
    return acc;
  }, {});

  // 💡 [자산 표기 방어 로직] total_asset과 assets 중 값이 있는 것을 자동으로 찾아 '억 원' 단위로 변환합니다.
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
          <p className="text-blue-200 text-sm mt-2 font-medium">내 Supabase DB와 실시간 연동된 대한민국 국회의원 대시보드</p>
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
            placeholder="의원 이름, 정당 또는 지역구를 입력하세요..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm"
          />
          <div className="flex gap-2">
            <button onClick={() => setViewType('card')} className={`px-4 py-2 rounded-xl text-xs font-bold ${viewType === 'card' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border'}`}>📱 카드 뷰</button>
            <button onClick={() => setViewType('list')} className={`px-4 py-2 rounded-xl text-xs font-bold ${viewType === 'list' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 border'}`}>📑 리스트 뷰</button>
          </div>
        </div>

        {/* 메인 렌더링 */}
        {filteredPoliticians.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-2xl border">
            {!loading && !errorMessage ? "🎉 DB 연결 성공! 테이블이 비어있거나 조건에 맞는 데이터가 없습니다." : "데이터 로딩 파이프라인 가동 중..."}
          </div>
        ) : viewType === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPoliticians.map((p: any) => (
              <div key={p.id} className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{p.name}</h3>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold">{p.party || '무소속'}</span>
                  </div>
                  <div className="space-y-1.5 text-sm text-gray-600 border-b pb-3 mb-3">
                    <p><span className="text-gray-400 font-medium">지역구:</span> {p.district || '정보 없음'}</p>
                    <p><span className="text-gray-400 font-medium">상임위:</span> {p.committee || '미정'}</p>
                    <p><span className="text-gray-400 font-medium">선수:</span> {p.election_count ? `${p.election_count}선` : '초선'}</p>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold text-blue-900 bg-blue-50/50 p-2 rounded-lg flex justify-between">
                    <span>신고 자산:</span>
                    <span>{renderAsset(p)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 bg-white p-4 rounded-2xl border shadow-sm">
            {filteredPoliticians.map((p: any) => (
              <div key={p.id} className="flex justify-between p-4 bg-white rounded-xl border border-gray-100 text-sm items-center">
                <span className="font-bold text-gray-900 w-24">{p.name}</span>
                <span className="text-gray-700 w-28 text-center">{p.party || '무소속'}</span>
                <span className="text-gray-600 flex-1 px-2">{p.district || '비례'}</span>
                <span className="font-semibold text-blue-950 text-right w-28">{renderAsset(p)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
