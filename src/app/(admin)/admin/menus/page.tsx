import { getAllMenus } from "@/lib/queries/menus";
import { MenuForm } from "./menu-form";
import { toggleMenu, deleteMenu } from "./actions";

export const dynamic = "force-dynamic";

export default async function MenusPage() {
  const menus = await getAllMenus();

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-8">
      <div>
        <h1 className="text-xl font-semibold">메뉴 관리</h1>
        <p className="mt-1 text-sm text-zinc-500">
          등록한 메뉴가 공개 사이트 상단에 표시됩니다. 끄면 사이트에서 숨겨집니다.
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
            <li key={menu.id} className="flex items-center gap-4 px-4 py-3">
              <span className="w-8 text-xs text-zinc-400">{menu.sort_order}</span>

              <div className="flex-1">
                <p className="text-sm font-medium">{menu.name}</p>
                <p className="text-xs text-zinc-400">/{menu.slug}</p>
              </div>

              <form
                action={async () => {
                  "use server";
                  await toggleMenu(menu.id, !menu.is_active);
                }}
              >
                <button
                  type="submit"
                  className={`rounded px-2 py-1 text-xs ${
                    menu.is_active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-zinc-100 text-zinc-400"
                  }`}
                >
                  {menu.is_active ? "사용중" : "숨김"}
                </button>
              </form>

              <form
                action={async () => {
                  "use server";
                  await deleteMenu(menu.id);
                }}
              >
                <button
                  type="submit"
                  className="text-xs text-zinc-400 hover:text-red-600"
                >
                  삭제
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
