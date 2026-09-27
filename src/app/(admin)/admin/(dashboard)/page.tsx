import { redirect } from "next/navigation";

/**
 * /admin 첫 화면은 상담 접수함. 변호사가 매일 하는 일은 "새 문의 왔나"이고,
 * 사이트 수정은 한 달에 몇 번이다. 요약 대시보드가 생기면 여기서 그린다.
 */
export default function AdminHome() {
  redirect("/admin/consultations");
}
