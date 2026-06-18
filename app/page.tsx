'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lnjduracoqurhlbzxefb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuamR1cmFjb3F1cmhsYnp4ZWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MDMwNjgsImV4cCI6MjA5NzI3OTA2OH0.9FM8_VhfEusohvG6JGvss36m10BRj3nCP5qtJk0SWM8';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function Home() {
  const [politicians, setPoliticians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const { data, error } = await supabase
          .from('politicians')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;
        if (data) setPoliticians(data);
      } catch (err) {
        console.error('데이터 로드 실패:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredData = politicians.filter(p => 
    (p.name && p.name.includes(searchTerm)) || (p.district && p.district.includes(searchTerm))
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-800">
      <div className="max-w-6xl mx-auto">
        
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-8 rounded-2xl shadow-md mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">🏛️ 취재시작 (Start-Chwijae)</h1>
          <p className="text-blue-200 text-sm mt-1.5 font-medium">내 Supabase DB와 실시간 연동된 대한민국 국회의원 대시보드</p>
        </div>

        <div className="mb-8">
          <input
            type="text"
            placeholder="🔍 의원 이름 또는 지역구를 입력하세요 (예: 마포, 홍길동)"
            className="w-full p-4 border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-24 space-y-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-medium text-sm">Supabase 데이터 가져오는 중...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((person) => (
              <div key={person.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">{person.name}</h2>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    person.party?.includes('민주') ? 'bg-blue-50 text-blue-600' :
                    person.party?.includes('국민') ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'
                  }`}>
                    {person.party || '무소속'}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-slate-600 border-t border-slate-50 pt-3">
                  <p><span className="font-semibold text-slate-400 w-16 inline-block">지역구</span>{person.district || '비례대표'}</p>
                  <p className="truncate"><span className="font-semibold text-slate-400 w-16 inline-block">상임위</span>{person.committee}</p>
                  <p className="text-xs text-slate-400 truncate mt-1">{person.email || '이메일 정보 없음'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}