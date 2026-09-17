import { redirect } from "next/navigation";

/**
 * /admin 은 아직 요약 화면이 없다. 변호사가 로그인하면 가장 자주 쓰는
 * 화면 구성(홈)으로 바로 보낸다. 요약 대시보드가 생기면 여기서 그린다.
 */
export default function AdminHome() {
  redirect("/admin/sections");
}
