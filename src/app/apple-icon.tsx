import { ImageResponse } from "next/og";

export const size = {
    width: 180,
    height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "white",
                }}
            >
                <svg
                    viewBox="0 0 40 48"
                    width="140"
                    height="168"
                    fill="none"
                >
                    <path
                        d="m27.6627 4h-15.3253l-12.3374 12.3373v15.3253l12.3374 12.3374h15.3253l12.3373-12.3374v-15.3253zm-13.2049 27.8554-7.90357-7.9036 7.90357-7.9036c2.988-2.988 7.9037-2.988 10.8916 0l7.9036 7.9036-7.9036 7.9036c-2.9879 2.988-7.8072 2.988-10.8916 0z"
                        fill="#1C1917"
                    />
                </svg>
            </div>
        ),
        {
            ...size,
        }
    );
}
