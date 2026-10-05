/** Turn Persian or Arabic-Indic digits (and the Persian decimal mark) into a number. */
export function parseLocalizedNumber(input: string): number {
  const latin = input
    .trim()
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[٫,]/g, ".");
  return latin === "" ? NaN : Number(latin);
}
