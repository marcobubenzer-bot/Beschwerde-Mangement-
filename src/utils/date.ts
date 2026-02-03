export const formatDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const toMonthKey = (value: string) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};
