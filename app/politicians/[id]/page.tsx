import { createClient } from '@/utils/supabase/server';

export default async function DetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: politician } = await supabase
    .from('politicians')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!politician) return <div>데이터를 찾을 수 없습니다.</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">{politician.name} ({politician.hj_name})</h1>
      <dl className="mt-4 space-y-2">
        <dt>정당</dt><dd>{politician.party}</dd>
        <dt>약력</dt><dd className="whitespace-pre-line">{politician.mem_title}</dd>
        <dt>사무실</dt><dd>{politician.assem_addr}</dd>
      </dl>
    </div>
  );
}
