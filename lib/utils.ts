// Utility functions - to be implemented by next agent

export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getCurrentHebrewYear(): number {
  const now = new Date();
  return now.getFullYear() + 3760;
}