/**
 * 헤더용 워드마크.
 * yoo-landing logo 구성을 기준으로 벡터로 다시 그린다.
 * 색은 currentColor — 부모가 color 를 지정한다.
 */
export function SiteLogo({
  className,
  title = "유앤파트너스",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 560 96"
      className={className}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <g fill="currentColor">
        <text
          x="280"
          y="46"
          textAnchor="middle"
          style={{
            fontFamily: "Georgia, 'Times New Roman', 'Noto Serif KR', serif",
            fontSize: 40,
            fontWeight: 600,
            letterSpacing: "0.07em",
          }}
        >
          YOO & PARTNERS
        </text>
        <text
          x="280"
          y="78"
          textAnchor="middle"
          style={{
            fontFamily:
              "var(--font-site-sans), 'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
            fontSize: 14,
            fontWeight: 400,
            letterSpacing: "0.34em",
          }}
        >
          유앤파트너스 법률사무소
        </text>
      </g>
    </svg>
  );
}
