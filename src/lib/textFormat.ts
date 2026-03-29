export function formatProductTitle(value?: string): string {
  const raw = sanitizeHumanText(String(value || "").trim());
  if (!raw) return "";
  const lowered = raw.toLocaleLowerCase("es");
  return lowered.charAt(0).toLocaleUpperCase("es") + lowered.slice(1);
}

export function sanitizeHumanText(input: string): string {
  let out = String(input || "");

  // Repara mojibake UTF-8 interpretado como latin1/cp1252.
  for (let i = 0; i < 3; i += 1) {
    if (!/[\u00C3\u00C2\u00E2]/.test(out)) break;
    let decoded = out;
    try {
      decoded = decodeURIComponent(escape(out));
    } catch {
      decoded = out;
    }
    if (!decoded || decoded === out) break;
    out = decoded;
  }

  const dictionary: Array<[string, string]> = [
    ["quinceañera", "quincea\u00f1era"],
    ["cariñosito", "cari\u00f1osito"],
    ["corazón", "coraz\u00f3n"],
    ["señorita", "se\u00f1orita"],
    ["reseñas", "rese\u00f1as"],
    ["reseña", "rese\u00f1a"],
    ["reseñas", "rese\u00f1as"],
  ];

  for (const [wrong, right] of dictionary) {
    const rx = new RegExp(wrong, "gi");
    out = out.replace(rx, right);
  }

  return out;
}
