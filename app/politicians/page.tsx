// app/politicians/page.tsx
import { createClient } from '@/utils/supabase/server';
import PoliticiansClient from './PoliticiansClient'; // 아래에 설명된 클라이언트 컴포넌트를 분리해야 합니다.

// 1. 서버 컴포넌트: 데이터 로딩을 담당합니다.
export default async function Page() {
  const supabase = await createClient();

  // Supabase에서 전체 데이터를 가져옵니다.
  const { data: politicians, error } = await supabase
    .from('politicians')
    .select('*');

  if (error) {
    return <div className="p-8 text-red-500">데이터를 불러오는 중 오류 발생: {error.message}</div>;
  }

  // 데이터가 없을 경우 빈 배열을 전달하여 에러를 방지합니다.
  const initialData = politicians || [];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">국회의원 목록 ({initialData.length}명)</h1>
      {/* 클라이언트 컴포넌트로 데이터를 넘겨주어 화면에서 필터링 기능을 구현합니다.
        서버 컴포넌트(Page)와 클라이언트 컴포넌트를 분리해야 상태 관리(useState)가 가능합니다.
      */}
      <PoliticiansClient initialData={initialData} />
    </div>
  );
}