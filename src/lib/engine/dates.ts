/** Arithmétique de dates en ISO (AAAA-MM-JJ), sans fuseau : un délai légal se compte en jours civils. */
const pad = (n: number) => String(n).padStart(2, '0');
export const iso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
export const parse = (s: string) => { const [y, m, d] = s.split('-').map(Number); return { y, m, d }; };
const dim = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();
/** Ajoute des mois ; le jour est ramené au dernier jour du mois s'il n'existe pas (31 → 30). */
export function addMonths(s: string, n: number): string {
  const { y, m, d } = parse(s);
  const t = y * 12 + (m - 1) + n, ny = Math.floor(t / 12), nm = (t % 12) + 1;
  return iso(ny, nm, Math.min(d, dim(ny, nm)));
}
export const addYears = (s: string, n: number) => addMonths(s, 12 * n);
export function addDays(s: string, n: number): string {
  const { y, m, d } = parse(s);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return iso(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}
/** Jours de a à b (b − a). */
export const daysBetween = (a: string, b: string) => { const A = parse(a), B = parse(b); return Math.round((Date.UTC(B.y, B.m - 1, B.d) - Date.UTC(A.y, A.m - 1, A.d)) / 86400000); };
/** Mois civils pleins de a à b (négatif si b est avant a). */
export function monthsBetween(a: string, b: string): number {
  const A = parse(a), B = parse(b);
  let n = (B.y - A.y) * 12 + (B.m - A.m);
  if (B.d < A.d) n -= 1;
  return n;
}
