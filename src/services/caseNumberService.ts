const counterKey = (year: number) => `kb_counter_${year}`;

export const generateCaseNumber = () => {
  const year = new Date().getFullYear();
  const key = counterKey(year);
  const raw = localStorage.getItem(key);
  const current = raw ? Number(raw) : 0;
  const next = current + 1;
  localStorage.setItem(key, String(next));
  const padded = String(next).padStart(5, '0');
  return `KB-${year}-${padded}`;
};
