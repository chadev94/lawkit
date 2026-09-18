/**
 * seed_from_source_sites.sql 과 동일한 콘텐츠를 service role 로 적용한다.
 *
 *   set -a && source .env.local && set +a && node scripts/apply-seed-content.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 필요");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function must(label, promise) {
  const { data, error } = await promise;
  if (error) {
    console.error(label, error.message);
    process.exit(1);
  }
  return data;
}

const PRACTICE_PAGE = "4fa6472e-4c2d-4f63-bad6-fdcbe781fe8e";
const CASES_PAGE = "ba0edb81-d3f6-4e0f-861b-09e35749ff8e";
const LAWYER_PAGE = "8a9b9ef6-ec0b-440f-9cea-a56155340e1e";
const HERO = "23394099-a6c1-4a09-98cb-00f19ee137c1";
const HOME_PRACTICE = "89ee3073-1260-4f3d-bf8a-4f9f8ddfb677";
const HOME_CASES = "c9a274a9-9560-45e8-afd4-f9e70cd5761f";
const HOME_CTA = "090215b8-02a6-4645-8d9c-ddf9f21a0d8f";
const HOME_CONTACT = "4bef9aa8-7381-4f06-a272-63a033d1026f";
const MENU_PRACTICE = "937cb919-d83e-4ca9-9c37-9f4560e0f0b7";
const MENU_LAWYER = "1ca3c769-c843-4aac-bc04-ad52618e3a47";

await must(
  "site_settings",
  supabase
    .from("site_settings")
    .update({
      content: {
        site_name: "유앤파트너스",
        tagline: "판사 옆에서 일한 변호사가, 이제 당신 옆에 섭니다",
        footer_text:
          "© 유앤파트너스 법률사무소 · 광고책임변호사 유환진. 본 사이트의 사례는 의뢰인 동의를 받아 비식별 처리되었습니다.",
        address: "서울특별시 종로구 율곡로 33, 10층 (안국빌딩)",
        address_detail: "지하철 3호선 안국역 6번 출구 도보 2분",
        phone: "02-6214-1114",
        email: "contact@yoopartnerslaw.com",
        business_number: "471-47-01088",
        representative: "유환진",
        privacy_policy_url: "https://www.ddabak.kr/privacy/",
      },
    })
    .eq("key", "default"),
);
console.log("OK site_settings");

await must(
  "home hero",
  supabase
    .from("page_sections")
    .update({
      title: "판사 옆에서 일한 변호사가, 이제 당신 옆에 섭니다",
      subtitle:
        "경찰에서 연락이 왔다면, 조사 전에 먼저 전화하세요. 사무장이 아닙니다. 전화하면 변호사 본인이 답합니다.",
      content: {
        eyebrow: "YOO & PARTNERS",
        cta_label: "무료 전화상담",
        cta_href: "tel:0262141114",
        background_image: "seed/hero/court.jpg",
      },
      is_active: true,
      sort_order: 0,
    })
    .eq("id", HERO),
);

await must(
  "home practice section",
  supabase
    .from("page_sections")
    .update({
      title: "업무분야",
      subtitle: "같은 사건도 누가, 어떻게 변호하느냐에 따라 결과가 달라집니다.",
      layout: "cards",
      is_active: true,
      sort_order: 1,
    })
    .eq("id", HOME_PRACTICE),
);

await must(
  "delete home practice items",
  supabase.from("page_section_items").delete().eq("page_section_id", HOME_PRACTICE),
);

await must(
  "insert home practice items",
  supabase.from("page_section_items").insert([
    {
      page_section_id: HOME_PRACTICE,
      sort_order: 0,
      title: "형사 변호",
      subtitle: "Criminal Defense",
      body: "폭행·사기·횡령·음주운전·마약·성범죄·명예훼손 등 형사 사건 전반. 경찰 조사 단계부터 대응하여 불기소, 감형, 집행유예 등 최선의 결과를 만들어 갑니다.",
      href: "/practice-areas",
      image_path: "/practice/criminal.jpg",
      meta: {},
      is_active: true,
    },
    {
      page_section_id: HOME_PRACTICE,
      sort_order: 1,
      title: "민사소송",
      subtitle: "Civil Litigation",
      body: "계약 분쟁, 손해배상, 건설 대금. 민사소송은 증거 구성이 승패를 가릅니다. 소장 작성부터 법정 변론까지 전 과정을 직접 수행합니다.",
      href: "/practice-areas",
      image_path: "/practice/civil.jpg",
      meta: {},
      is_active: true,
    },
    {
      page_section_id: HOME_PRACTICE,
      sort_order: 2,
      title: "기업자문",
      subtitle: "Corporate Advisory",
      body: "계약서 검토, 내부 규정 정비, 분쟁 예방. 대형로펌에서 기업 자문을 수행한 변호사가 합리적인 비용으로 같은 수준의 자문을 제공합니다.",
      href: "/practice-areas",
      image_path: "/practice/corporate.jpg",
      meta: {},
      is_active: true,
    },
  ]),
);

await must(
  "home cases section",
  supabase
    .from("page_sections")
    .update({
      title: "결과로 보여드립니다",
      subtitle: "어려운 사건도 결과를 바꿉니다",
      layout: "carousel",
      content: {
        variant: "",
        show_source: true,
        stats: "무죄 4건, 항소심 원심 파기 3건. 전부 2026년 선고입니다.",
        stats_marks: "무죄 4건|항소심 원심 파기 3건",
      },
      is_active: true,
      sort_order: 2,
    })
    .eq("id", HOME_CASES),
);

await must(
  "delete home cases items",
  supabase.from("page_section_items").delete().eq("page_section_id", HOME_CASES),
);

const caseItems = [
  ["준강간미수", "1심 유죄 → 항소심 무죄", "서울고등법원 2026. 6. 4. 피해자 진술의 신빙성을 다퉜습니다. 원심 파기 · 무죄.", "01"],
  ["특경법 횡령 5억 원 이상", "1심 징역 3년 → 선고유예", "횡령액을 5억 원 미만으로 다퉈 형법 횡령으로 변경, 선고유예. 서울고등법원 2026. 8. 18.", "02"],
  ["교통사고 치상·음주운전", "1심 집행유예 → 무죄", "치상·음주운전 두 죄 모두 무죄. 서울북부지방법원 2026. 8. 27.", "03"],
  ["사기 기소", "1심 무죄", "서울남부지방법원 2026. 6. 11. 무죄.", "04"],
  ["통신매체이용음란 기소", "1심 무죄", "수원지방법원 2026. 7. 9. 무죄.", "05"],
  ["강제추행치상", "법정형 5년 이상 → 집행유예", "징역 1년 6월 · 집행유예 3년. 보호관찰명령 청구 기각. 서울중앙지방법원 2026. 6. 12.", "06"],
];

await must(
  "insert home cases items",
  supabase.from("page_section_items").insert(
    caseItems.map(([title, subtitle, body, n], i) => ({
      page_section_id: HOME_CASES,
      sort_order: i,
      title,
      subtitle,
      body,
      href: "/cases",
      image_path: `seed/cases/${n}-card.jpg`,
      meta: {},
      is_active: true,
    })),
  ),
);

await must(
  "home cta",
  supabase
    .from("page_sections")
    .update({
      title: "체포·구속은 시간이 생명입니다",
      subtitle: "경찰 연락을 받았다면, 조사 전에 반드시 변호사와 통화하세요.",
      content: { badge: "YOUR SITUATION", button_label: "지금 상담하기" },
      is_active: true,
      sort_order: 3,
    })
    .eq("id", HOME_CTA),
);

await must(
  "home contact",
  supabase
    .from("page_sections")
    .update({
      title: "변호사에게 연락하는 게 맞을까, 고민되시죠?",
      subtitle:
        "모든 상담은 비밀이 보장됩니다. 가족이 대신 오셔도 됩니다. 구속·영장실질심사 사건은 당일 대응합니다.",
      content: {
        consent_label: "개인정보 수집·이용에 동의합니다",
        submit_label: "상담 신청",
        success_message: "문의가 접수되었습니다. 변호사가 직접 연락드립니다.",
      },
      is_active: true,
      sort_order: 4,
    })
    .eq("id", HOME_CONTACT),
);

async function resetPage(pageId) {
  const sections = await must(
    `list sections ${pageId}`,
    supabase.from("page_sections").select("id").eq("page_id", pageId),
  );
  const ids = (sections ?? []).map((s) => s.id);
  if (ids.length) {
    await must(
      `delete items ${pageId}`,
      supabase.from("page_section_items").delete().in("page_section_id", ids),
    );
    await must(
      `delete sections ${pageId}`,
      supabase.from("page_sections").delete().eq("page_id", pageId),
    );
  }
}

await resetPage(PRACTICE_PAGE);
await must(
  "practice sections",
  supabase.from("page_sections").insert([
    {
      id: "a1111111-1111-4111-8111-111111111101",
      page_id: PRACTICE_PAGE,
      kind: "hero",
      menu_id: null,
      title: "업무분야",
      subtitle: "형사·민사·기업자문. 경찰 조사 단계부터 끝까지 같은 변호사가 함께합니다.",
      layout: "cards",
      sort_order: 0,
      is_active: true,
      content: {
        eyebrow: "PRACTICE AREAS",
        cta_label: "상담 신청",
        cta_href: "/#contact",
        background_image: "seed/hero/court.jpg",
      },
    },
    {
      id: "a1111111-1111-4111-8111-111111111102",
      page_id: PRACTICE_PAGE,
      kind: "menu",
      menu_id: MENU_PRACTICE,
      title: "주요 업무",
      subtitle: "같은 사건도 누가, 어떻게 변호하느냐에 따라 결과가 달라집니다.",
      layout: "cards",
      sort_order: 1,
      is_active: true,
      content: {},
    },
  ]),
);

await must(
  "practice items",
  supabase.from("page_section_items").insert([
    {
      page_section_id: "a1111111-1111-4111-8111-111111111102",
      sort_order: 0,
      title: "형사 변호",
      subtitle: "폭행·상해 · 사기 · 횡령·배임 · 음주운전 · 마약 · 성범죄 · 명예훼손",
      body: "경찰 조사 단계부터 대응하여 불기소, 약식명령, 선고유예, 집행유예 등 최선의 결과를 만들어 갑니다. 첫 조사가 결과를 결정합니다.",
      image_path: "/practice/criminal.jpg",
      meta: {},
      is_active: true,
    },
    {
      page_section_id: "a1111111-1111-4111-8111-111111111102",
      sort_order: 1,
      title: "민사소송",
      subtitle: "계약금 반환 · 매매대금 · 공사대금 · 손해배상 · 임대차",
      body: "재판연구원으로 민사 사건을 포함한 다양한 판결을 검토한 경험으로, 어떤 증거가 재판부를 움직이는지 알고 전략을 세웁니다.",
      image_path: "/practice/civil.jpg",
      meta: {},
      is_active: true,
    },
    {
      page_section_id: "a1111111-1111-4111-8111-111111111102",
      sort_order: 2,
      title: "기업자문",
      subtitle: "계약서 · 주주간계약 · 인사·노무 · 공정거래 · 개인정보",
      body: "문제가 터지기 전에 연락하세요. 정기자문 또는 건별 자문 모두 가능합니다.",
      image_path: "/practice/corporate.jpg",
      meta: {},
      is_active: true,
    },
    {
      page_section_id: "a1111111-1111-4111-8111-111111111102",
      sort_order: 3,
      title: "채권추심·강제집행",
      subtitle: "지급명령 · 가압류 · 소액소송 · 압류·추심",
      body: "소액 채권도 뒷순위로 미루지 않습니다. 지급명령부터 강제집행까지 전 과정을 담당 변호사가 챙깁니다.",
      image_path: "/practice/enforcement.jpg",
      meta: {},
      is_active: true,
    },
  ]),
);

await resetPage(CASES_PAGE);
await must(
  "cases sections",
  supabase.from("page_sections").insert([
    {
      id: "a2222222-2222-4222-8222-222222222201",
      page_id: CASES_PAGE,
      kind: "hero",
      title: "결과로 보여드립니다",
      subtitle:
        "무죄 4건, 항소심 원심 파기 3건. 전부 2026년 선고입니다. 의뢰인 동의를 받아 비식별 게재했습니다.",
      layout: "cards",
      sort_order: 0,
      is_active: true,
      content: {
        eyebrow: "CASE RESULTS",
        cta_label: "상담하기",
        cta_href: "tel:0262141114",
        background_image: "seed/hero/og.png",
      },
    },
    {
      id: "a2222222-2222-4222-8222-222222222202",
      page_id: CASES_PAGE,
      kind: "page_link",
      source_page_id: CASES_PAGE,
      title: "결과로 보여드립니다",
      subtitle: "어려운 사건도 결과를 바꿉니다",
      layout: "carousel",
      sort_order: 1,
      is_active: true,
      content: {
        variant: "",
        show_source: false,
        stats: "무죄 4건, 항소심 원심 파기 3건. 전부 2026년 선고입니다.",
        stats_marks: "무죄 4건|항소심 원심 파기 3건",
      },
    },
  ]),
);

await must(
  "cases items",
  supabase.from("page_section_items").insert(
    caseItems.map(([title, subtitle, body, n], i) => ({
      page_section_id: "a2222222-2222-4222-8222-222222222202",
      sort_order: i,
      title,
      subtitle: `${subtitle} · 법원`,
      body,
      image_path: `seed/cases/${n}-card.jpg`,
      meta: {},
      is_active: true,
    })),
  ),
);

await resetPage(LAWYER_PAGE);
await must(
  "lawyer sections",
  supabase.from("page_sections").insert([
    {
      id: "a3333333-3333-4333-8333-333333333301",
      page_id: LAWYER_PAGE,
      kind: "hero",
      title: "유환진 대표변호사",
      subtitle: "경찰 조사부터 항소심까지, 변호사가 직접 맡습니다.",
      layout: "cards",
      sort_order: 0,
      is_active: true,
      content: {
        eyebrow: "서울고등법원 재판연구원 출신",
        cta_label: "1:1 전화상담",
        cta_href: "tel:0262141114",
        background_image: "seed/lawyer/profile.jpg",
      },
    },
    {
      id: "a3333333-3333-4333-8333-333333333302",
      page_id: LAWYER_PAGE,
      kind: "menu",
      menu_id: MENU_LAWYER,
      title: "경력 · 차별점",
      subtitle: "재판부가 어떤 증거를 신뢰하고, 어떤 주장을 받아들이는지 압니다.",
      layout: "list",
      sort_order: 1,
      is_active: true,
      content: {},
    },
  ]),
);

await must(
  "lawyer items",
  supabase.from("page_section_items").insert([
    {
      page_section_id: "a3333333-3333-4333-8333-333333333302",
      sort_order: 0,
      title: "유환진",
      subtitle: "대표변호사 · 제11회 변호사시험 합격",
      body: "서울고등법원에서 3년간 500건 이상의 사건을 검토하며, 어떤 증거가 판결을 움직이고 어떤 주장이 받아들여지지 않는지를 가까이서 봤습니다. 그 눈을 가지고 대형로펌에서 형사 사건을 중심으로 실전을 뛰었고, 지금은 의뢰인의 사건에 쓰고 있습니다.",
      image_path: "seed/lawyer/profile.jpg",
      meta: {},
      is_active: true,
    },
    {
      page_section_id: "a3333333-3333-4333-8333-333333333302",
      sort_order: 1,
      title: "서울고등법원 재판연구원",
      subtitle: "2022–2025",
      body: "민사·형사·행정 3개 부에서 500건 이상의 사건을 검토하며 재판부의 판단 기준을 체득했습니다.",
      image_path: "seed/hero/court.jpg",
      meta: {},
      is_active: true,
    },
    {
      page_section_id: "a3333333-3333-4333-8333-333333333302",
      sort_order: 2,
      title: "법무법인(유한) 화우",
      subtitle: "2025–2026",
      body: "형사 변호와 기업 분쟁 사건에서 재판연구원 경험을 실전에 적용했습니다.",
      image_path: null,
      meta: {},
      is_active: true,
    },
    {
      page_section_id: "a3333333-3333-4333-8333-333333333302",
      sort_order: 3,
      title: "유앤파트너스 대표변호사",
      subtitle: "2026–현재",
      body: "끝까지 같은 변호사. 처음 만난 변호사가 판결까지 함께합니다. 전화하면 변호사 본인이 받습니다.",
      image_path: null,
      meta: {},
      is_active: true,
    },
    {
      page_section_id: "a3333333-3333-4333-8333-333333333302",
      sort_order: 4,
      title: "왜 다른가",
      subtitle: "서면·증거·양형자료의 기준",
      body: "서면을 쓸 때 재판부가 판결문에 옮겨 쓸 수 있는지를 기준으로 씁니다. 증거를 다툴 때 재판부가 신빙성을 판단하는 순서대로 반박합니다. 양형자료를 낼 때 양형 이유에 실제로 인용되는 종류의 자료만 골라 냅니다.",
      image_path: null,
      meta: {},
      is_active: true,
    },
  ]),
);

await must("hide test menu", supabase.from("menus").update({ is_active: false }).eq("slug", "test"));
await must("hide test page", supabase.from("pages").update({ is_active: false }).eq("slug", "test"));

console.log("OK content seeded");
const { data: listed } = await supabase.storage.from("section-media").list("seed");
console.log(
  "storage seed/:",
  (listed ?? []).map((f) => f.name).join(", "),
);
