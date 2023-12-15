export function getReferenceKey(s: string): string {
  if (s.includes(":")) {
    s = s.split(":")[1];
  }
  return s;
}

export function getReferenceTable(s: string): string {
  if (s.includes(":")) {
    s = s.split(":")[0];
  }
  return s;
}
