import { KakaoMap } from "@/components/site/kakao-map";
import type { SiteSettings } from "@/lib/site-settings";

function display(value: string) {
  return value.trim() || "—";
}

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const { content } = settings;
  const privacyUrl = content.privacy_policy_url.trim();

  return (
    <footer
      className="border-t"
      style={{
        borderColor: "var(--border)",
        background: "var(--muted)",
      }}
    >
      <div className="mx-auto max-w-5xl px-6 py-12">
        <p
          className="text-sm font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-site-heading)" }}
          data-field="content.site_name"
        >
          {content.site_name}
        </p>
        {content.tagline && (
          <p
            className="mt-2 text-xs"
            style={{ color: "var(--muted-foreground)" }}
            data-field="content.tagline"
          >
            {content.tagline}
          </p>
        )}

        <div
          className="mt-6 grid gap-8 text-xs sm:grid-cols-3"
          style={{ color: "var(--muted-foreground)" }}
        >
          <dl className="space-y-1">
            <div className="flex gap-2">
              <dt className="w-12 shrink-0">주소</dt>
              <dd style={{ color: "var(--accent)" }} data-field="content.address">
                {display(
                  [content.address, content.address_detail]
                    .map((v) => v.trim())
                    .filter(Boolean)
                    .join(" "),
                )}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-12 shrink-0">전화</dt>
              <dd style={{ color: "var(--accent)" }} data-field="content.phone">
                {display(content.phone)}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-12 shrink-0">이메일</dt>
              <dd style={{ color: "var(--accent)" }} data-field="content.email">
                {display(content.email)}
              </dd>
            </div>
          </dl>

          <div className="space-y-1">
            <p style={{ color: "var(--accent)" }} data-field="content.business_number">
              사업자등록번호 {display(content.business_number)}
            </p>
            <p style={{ color: "var(--accent)" }} data-field="content.representative">
              대표변호사 {display(content.representative)}
            </p>
          </div>

          <div className="space-y-1">
            {privacyUrl ? (
              <a
                href={privacyUrl}
                className="underline-offset-2 hover:underline"
                style={{ color: "var(--accent)" }}
              >
                개인정보처리방침
              </a>
            ) : (
              <p style={{ color: "var(--accent)" }}>개인정보처리방침</p>
            )}
          </div>
        </div>

        {content.address.trim() && (
          <div className="mt-8">
            <KakaoMap address={content.address} />
          </div>
        )}

        <p
          className="mt-8 text-xs"
          style={{ color: "var(--accent)" }}
          data-field="content.footer_text"
        >
          {content.footer_text ||
            `© ${new Date().getFullYear()} ${content.site_name}. All rights reserved.`}
        </p>
      </div>
    </footer>
  );
}
