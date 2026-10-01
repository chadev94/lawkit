import { KakaoMap } from "@/components/site/kakao-map";
import { ChannelLogo } from "@/components/site/channel-logo";
import { CHANNEL_META, visibleChannels } from "@/lib/site-channels";
import type { SiteSettings } from "@/lib/site-settings";

function display(value: string) {
  return value.trim() || "—";
}

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const { content } = settings;
  const privacyUrl = content.privacy_policy_url.trim();
  const channels = visibleChannels(content.channels);

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

          {/* 전화·이메일 줄과 같은 규칙: 이름은 회색, 값만 강조색 */}
          <dl className="space-y-1">
            <div className="flex gap-2">
              <dt className="shrink-0">사업자등록번호</dt>
              <dd style={{ color: "var(--accent)" }} data-field="content.business_number">
                {display(content.business_number)}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0">대표변호사</dt>
              <dd style={{ color: "var(--accent)" }} data-field="content.representative">
                {display(content.representative)}
              </dd>
            </div>
          </dl>

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

        {channels.length > 0 && (
          <ul
            className="mt-6 flex flex-wrap items-center gap-2.5 border-t pt-5"
            style={{ borderColor: "var(--border)" }}
            aria-label="채널"
          >
            {channels.map((channel) => (
              <li key={channel.key}>
                <a
                  href={channel.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={CHANNEL_META[channel.key].label}
                  title={`${CHANNEL_META[channel.key].label} (새 창)`}
                  data-field={`channels.${channel.key}`}
                  className="m-channel"
                >
                  <ChannelLogo channel={channel.key} />
                </a>
              </li>
            ))}
          </ul>
        )}

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
