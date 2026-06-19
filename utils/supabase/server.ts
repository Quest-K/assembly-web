// utils/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Next.js 서버 환경에서 Supabase 클라이언트를 생성하는 함수입니다.
 * 이 클라이언트는 쿠키를 통해 사용자의 인증 상태를 유지합니다.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    // Supabase URL: Vercel 환경 변수에서 가져옵니다.
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Supabase 서비스 롤 키: 서버 전용 키이므로 보안에 유의하세요.
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          // 서버 측에서 쿠키 값을 읽어옵니다.
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // 필요한 경우 쿠키를 설정합니다.
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // 서버 컴포넌트에서 쿠키 설정 시 발생할 수 있는 에러 무시
          }
        },
        remove(name: string, options: CookieOptions) {
          // 필요한 경우 쿠키를 삭제합니다.
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // 서버 컴포넌트에서 쿠키 삭제 시 발생할 수 있는 에러 무시
          }
        },
      },
    }
  );
}
