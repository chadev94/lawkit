import { getAllMenus } from "@/lib/queries/menus";
import { MenuForm } from "./menu-form";
import { MenuItem } from "./menu-item";

export const dynamic = "force-dynamic";

export default async function MenusPage() {
  const menus = await getAllMenus();

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold">메뉴 관리</h1>
        <p className="mt-1 text-sm text-zinc-500">
          등록한 메뉴가 공개 사이트 상단에 표시됩니다. 경로(slug)는{" "}
          <code className="text-xs">/{`{slug}`}</code> 페이지로 연결됩니다.
        </p>
      </div>

      <MenuForm />

      {menus.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-400">
          등록된 메뉴가 없습니다.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200">
          {menus.map((menu) => (
            <MenuItem key={menu.id} menu={menu} />
          ))}
        </ul>
      )}
    </main>
  );
}
