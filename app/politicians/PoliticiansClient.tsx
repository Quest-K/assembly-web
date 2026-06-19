// app/politicians/PoliticiansClient.tsx
'use client'; // 이 파일은 브라우저에서 실행됨을 명시

import { useState, useMemo } from 'react';

export default function PoliticiansClient({ initialData }: { initialData: any[] }) {
  const [selectedParty, setSelectedParty] = useState('전체');

  // 상단 요약용 데이터 계산 (에러 방지 로직 적용)
  const partyCounts = useMemo(() => {
    return (initialData || []).reduce((acc: Record<string, number>, p: any) => {
      const party = p.party || '무소속';
      acc[party] = (acc[party] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [initialData]);

  // 필터링 로직
  const filteredData = useMemo(() => {
    if (selectedParty === '전체') return initialData;
    return initialData.filter((p: any) => p.party === selectedParty);
  }, [initialData, selectedParty]);

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button onClick={() => setSelectedParty('전체')} className="px-4 py-2 border rounded">전체</button>
        {Object.keys(partyCounts).map((party) => (
          <button key={party} onClick={() => setSelectedParty(party)} className="px-4 py-2 border rounded">
            {party} ({partyCounts[party]})
          </button>
        ))}
      </div>
      
      <table className="w-full border-collapse border">
        <thead>
          <tr>
            <th className="border p-2">이름</th>
            <th className="border p-2">정당</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((p: any) => (
            <tr key={p.id}>
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">{p.party}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}