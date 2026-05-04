import { ImageResponse } from "next/og";
import { siteName } from "@/lib/site";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background: "#ffffff",
          color: "#1f2937",
          fontFamily: "Arial, sans-serif",
          position: "relative"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(37,178,74,0.18), transparent 28%), radial-gradient(circle at bottom left, rgba(139,16,40,0.14), transparent 22%)"
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "70px 90px",
            width: "100%"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginBottom: 34
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 94,
                height: 94,
                borderRadius: 999,
                background: "#8b1028",
                color: "#ffffff",
                fontSize: 34,
                fontWeight: 800
              }}
            >
              E
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column"
              }}
            >
              <div
                style={{
                  fontSize: 52,
                  fontWeight: 800,
                  lineHeight: 1
                }}
              >
                {siteName}
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 22,
                  color: "#25b24a",
                  fontWeight: 700
                }}
              >
                CBE and KCSE Learning Support
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.05,
              maxWidth: 900
            }}
          >
            Resources, self-learning junior classes, and teacher tools in one place.
          </div>

          <div
            style={{
              marginTop: 28,
              display: "flex",
              gap: 16,
              fontSize: 24,
              color: "#475569"
            }}
          >
            <div
              style={{
                display: "flex",
                padding: "14px 22px",
                borderRadius: 999,
                background: "#f0fdf4",
                color: "#166534",
                fontWeight: 700
              }}
            >
              Lesson plans
            </div>
            <div
              style={{
                display: "flex",
                padding: "14px 22px",
                borderRadius: 999,
                background: "#fff7ed",
                color: "#9a3412",
                fontWeight: 700
              }}
            >
              Revision support
            </div>
            <div
              style={{
                display: "flex",
                padding: "14px 22px",
                borderRadius: 999,
                background: "#fdf2f8",
                color: "#9d174d",
                fontWeight: 700
              }}
            >
              Scheme Bot
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
