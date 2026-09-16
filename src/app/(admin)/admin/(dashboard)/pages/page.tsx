import { getAllPages } from "@/lib/queries/pages";
import { PageForm } from "./page-form";
import { PageItem } from "./page-item";

export const dynamic = "force-dynamic";

export default async function PagesPage() {
  const pages = await getAllPages();

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <div>
        <h1 className="a-title">페이지 관리</h1>
        <p className="a-lead mt-1">
          페이지는 <code className="text-xs">/{`{slug}`}</code> 로 열리고,
          &ldquo;메뉴 노출&rdquo;을 켜면 공개 사이트 상단에 표시됩니다. 섹션 배치는
          페이지 구성에서 합니다.
        </p>
      </div>

      <PageForm />

      {pages.length === 0 ? (
        <p className="a-empty">
          등록된 페이지가 없습니다.
        </p>
      ) : (
        <ul className="a-list">
          {pages.map((page) => (
            <PageItem key={page.id} page={page} />
          ))}
        </ul>
      )}
    </main>
  );
}
