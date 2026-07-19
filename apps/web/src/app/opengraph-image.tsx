import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * La tarjeta de enlace de Socratia — lo que se ve al pegar la liga en
 * WhatsApp, iMessage o X. Se dibuja en build con el mismo lenguaje visual de
 * la portada: crema cálido, rejilla hairline, eyebrow mono, titular Geist en
 * peso 500 con el precio en verde salvia subrayado, y la tortuga (el logo
 * real) caminando sobre el hairline del pie.
 *
 * Paleta tomada de tailwind.config.ts — si la marca cambia allá, cambia acá.
 */

export const alt =
  "Socratia — Contrata un equipo completo para tu oficina. Por $499 al mes.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CREMA = "#FEFCF5"; // oficina.fondo
const HAIRLINE = "#E9E4D6"; // oficina.borde
const TINTA = "#1E2A23"; // oficina.texto
const TENUE = "#6E7771"; // oficina.tenue
const SALVIA = "#3E7D5A"; // marca.DEFAULT
const SALVIA_SUAVE = "#81B09A"; // marca.suave — solo tintes/subrayados

async function fuente(relativa: string) {
  return readFile(
    path.join(process.cwd(), "node_modules/geist/dist/fonts", relativa),
  );
}

export default async function ImagenOpenGraph() {
  const [sansMedium, monoRegular, tortuga] = await Promise.all([
    fuente("geist-sans/Geist-Medium.ttf"),
    fuente("geist-mono/GeistMono-Regular.ttf"),
    readFile(path.join(process.cwd(), "public/marca/tortuga.png")),
  ]);
  const tortugaSrc = `data:image/png;base64,${tortuga.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: CREMA,
          // La rejilla sutil del hero — un tono más suave que el hairline,
          // para que en el thumbnail chico de WhatsApp sea textura, no ruido
          backgroundImage: `linear-gradient(#F1EDE1 1px, transparent 1px), linear-gradient(90deg, #F1EDE1 1px, transparent 1px)`,
          backgroundSize: "78px 78px",
          fontFamily: "Geist",
        }}
      >
        {/* filo izquierdo en verde de marca (como la landing) */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 10,
            height: 630,
            backgroundColor: SALVIA,
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            padding: "56px 72px 0 88px",
          }}
        >
          {/* wordmark */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
            }}
          >
            <img src={tortugaSrc} width={54} height={54} />
            <div
              style={{
                display: "flex",
                fontSize: 34,
                fontWeight: 500,
                letterSpacing: "0.18em",
                color: TINTA,
              }}
            >
              SOCRATIA
            </div>
          </div>

          {/* eyebrow mono con "/" — el patrón de todas las secciones */}
          <div
            style={{
              display: "flex",
              marginTop: 74,
              fontFamily: "GeistMono",
              fontSize: 22,
              letterSpacing: "0.14em",
              color: TENUE,
            }}
          >
            / PARA ASESORES DE CRÉDITO EMPRESARIAL
          </div>

          {/* titular: peso 500, tracking apretado, precio en salvia subrayado */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 26,
              fontSize: 74,
              fontWeight: 500,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              color: TINTA,
            }}
          >
            {/* Cada línea se compone palabra por palabra con espacio fijo:
                el motor de dibujo ensancha los espacios de forma dispareja
                cuando hay tracking negativo (se veía "Contrata  un"). */}
            <div style={{ display: "flex", gap: 17 }}>
              {["Contrata", "un", "equipo", "completo"].map((p) => (
                <div key={p} style={{ display: "flex" }}>
                  {p}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 17 }}>
              {["para", "tu", "oficina."].map((p) => (
                <div key={p} style={{ display: "flex" }}>
                  {p}
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 6,
                color: SALVIA,
              }}
            >
              <div style={{ display: "flex", gap: 17 }}>
                {["Por", "$499", "al", "mes."].map((p) => (
                  <div key={p} style={{ display: "flex" }}>
                    {p}
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 10,
                  width: 520,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: SALVIA_SUAVE,
                  opacity: 0.55,
                }}
              />
            </div>
          </div>
        </div>

        {/* la tortuga camina sobre el hairline del pie */}
        <img
          src={tortugaSrc}
          width={132}
          height={132}
          style={{ position: "absolute", right: 96, bottom: 86 }}
        />

        {/* pie: hairline + dominio y promesa en mono */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "0 72px 0 88px",
            padding: "26px 0 34px",
            borderTop: `1.5px solid ${HAIRLINE}`,
            fontFamily: "GeistMono",
            fontSize: 22,
            color: TENUE,
          }}
        >
          <div style={{ display: "flex" }}>socratia.mateinnovation.com</div>
          <div style={{ display: "flex" }}>
            14 días gratis · Cancela cuando quieras
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: sansMedium, weight: 500, style: "normal" },
        { name: "GeistMono", data: monoRegular, weight: 400, style: "normal" },
      ],
    },
  );
}
