import { getSiteHostname, OG } from "@/lib/og";

interface OgCardProps {
  eyebrow: string;
  title: string;
  description?: string;
  meta?: string;
  footer: string;
}

const SKELETON_ROWS = [
  { bar: 240, selected: true },
  { bar: 180, selected: false },
  { bar: 210, selected: false },
];

function FormSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        width: 300,
        background: OG.card,
        border: `1px solid ${OG.hairline}`,
        borderRadius: 16,
        padding: "24px 24px 20px",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          height: 10,
          width: 120,
          borderRadius: 999,
          background: OG.hairline,
          marginBottom: 4,
        }}
      />
      {SKELETON_ROWS.map((row, index) => (
        <div
          key={index}
          style={{ display: "flex", alignItems: "center", gap: 14 }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 999,
              border: row.selected ? "none" : `2px solid ${OG.hairline}`,
              background: row.selected ? OG.accent : "transparent",
            }}
          />
          <div
            style={{
              height: 12,
              width: row.bar,
              borderRadius: 999,
              background: OG.skeleton,
            }}
          />
        </div>
      ))}
      <div
        style={{
          height: 36,
          width: 110,
          alignSelf: "flex-end",
          marginTop: 8,
          borderRadius: 999,
          background: OG.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: OG.primaryForeground, fontSize: 14, fontWeight: 600 }}>
          Submit
        </span>
      </div>
    </div>
  );
}

export function OgCard({
  eyebrow,
  title,
  description,
  meta,
  footer,
}: OgCardProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: OG.background,
        color: OG.foreground,
        fontFamily: "Bricolage Grotesque",
        padding: "56px 64px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${OG.hairline}`,
          paddingBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              background: OG.accent,
            }}
          />
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: 3 }}>
            Formbrew
          </span>
        </div>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: OG.muted,
          }}
        >
          {getSiteHostname()}
        </span>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 64,
          padding: "32px 0",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            maxWidth: 620,
            flex: 1,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: OG.accent,
              letterSpacing: 2.5,
            }}
          >
            {eyebrow}
          </span>
          <span
            style={{
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -1.5,
            }}
          >
            {title}
          </span>
          {description ? (
            <span
              style={{ fontSize: 22, color: OG.muted, lineHeight: 1.4 }}
            >
              {description}
            </span>
          ) : null}
          {meta ? (
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: OG.muted,
                letterSpacing: 1.5,
              }}
            >
              {meta}
            </span>
          ) : null}
        </div>

        <FormSkeleton />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: `1px solid ${OG.hairline}`,
          paddingTop: 20,
        }}
      >
        <span style={{ fontSize: 14, color: OG.muted }}>{footer}</span>
      </div>
    </div>
  );
}
