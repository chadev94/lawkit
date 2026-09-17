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
          사이트의 페이지 목록입니다. &ldquo;메뉴에 표시&rdquo;를 켜면 상단 메뉴에
          나옵니다. 각 페이지 안의 내용은 화면 구성에서 고칩니다.
        </p>
      </div>

      <PageForm />

      {pages.length === 0 ? (
        <p className="a-empty">
          등록된 페이지가 없습니다. 위에서 첫 페이지를 추가하세요.
        </p>
      ) : (
        <ul className="a-list">
          {pages.map((page, index) => (
            <PageItem
              key={page.id}
              page={page}
              position={index}
              count={pages.length}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
