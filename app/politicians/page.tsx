// app/politicians/page.tsx
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화 (server-side용)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function Page() {
  // 에러를 잡기 위해 try-catch 추가
  try {
    const { data: politicians, error } = await supabase
      .from('politicians')
      .select('*');

    if (error) {
      console.error("Supabase 에러 상세:", error);
      return <div>데이터를 불러오는 중 에러가 발생했습니다: {error.message}</div>;
    }

    if (!politicians || politicians.length === 0) {
      return <div>등록된 데이터가 없습니다.</div>;
    }

    return (
      <div className="p-8">
        <h1 className="text-xl font-bold mb-4">국회의원 목록 ({politicians.length}명)</h1>
        <pre>{JSON.stringify(politicians[0], null, 2)}</pre> {/* 데이터 구조 확인용 */}
      </div>
    );
  } catch (err) {
    return <div>시스템 에러 발생</div>;
  }
}
