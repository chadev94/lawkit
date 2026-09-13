import { getActiveMenus } from "@/lib/queries/menus";
import { Hero } from "@/components/site/hero";
import { MenuSection } from "@/components/site/menu-section";
import { ConsultationCta } from "@/components/site/consultation-cta";
import { ContactForm } from "@/components/site/contact-form";

export default async function Home() {
  const menus = await getActiveMenus();

  return (
    <>
      <Hero />

      {menus.length === 0 ? (
        <section className="py-24 text-center">
          <p className="text-sm text-zinc-400">
            등록된 메뉴가 없습니다. admin에서 메뉴를 추가하면 여기에 섹션이 생깁니다.
          </p>
        </section>
      ) : (
        menus.map((menu) => <MenuSection key={menu.id} menu={menu} />)
      )}

      <ConsultationCta />
      <ContactForm />
    </>
  );
}
