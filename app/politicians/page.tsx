'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';

export default function PoliticiansPage({ initialData }: { initialData: any[] }) {
  const [selectedParty, setSelectedParty] = useState('전체');

  // 1. 상단 요약용 데이터 계산
  const partyCounts = useMemo(() => {
    const counts = initialData.reduce((acc, p) => {
      acc[p.party] = (acc[p.party] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { 전체: initialData.length, ...counts };
  }, [initialData]);

  // 2. 필터링 로직
  const filteredData = useMemo(() => {
    return selectedParty === '전체' ? initialData : initialData.filter(p => p.party === selectedParty);
  }, [selectedParty, initialData]);

  return (
    <div className="p-8">
      {/* 상단: 정당별 인원수 */}
      <div className="flex gap-4 mb-8">
        {Object.entries(partyCounts).map(([party, count]) => (
          <button key={party} onClick={() => setSelectedParty(party)} 
                  className={`p-4 border rounded ${selectedParty === party ? 'bg-blue-500 text-white' : ''}`}>
            {party}: {count}명
          </button>
        ))}
      </div>

      {/* 중간: 표 형식 */}
      <table className="w-full border-collapse border">
        <thead>
          <tr><th>이름</th><th>정당</th><th>이메일</th><th>연락처</th></tr>
        </thead>
        <tbody>
          {filteredData.map((p) => (
            <tr key={p.id} className="hover:bg-gray-100 cursor-pointer">
              <td><Link href={`/politicians/${p.id}`}>{p.name}</Link></td>
              <td>{p.party}</td>
              <td>{p.email}</td>
              <td>{p.tel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
