// plural(5, 'урок', 'урока', 'уроков') → '5 уроков'
export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  const word =
    mod10 === 1 && mod100 !== 11 ? one : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? few : many;
  return `${n} ${word}`;
}

export const lessonsWord = (n: number) => plural(n, 'урок', 'урока', 'уроков');
export const cardsWord = (n: number) => plural(n, 'карточка', 'карточки', 'карточек');
export const rulesWord = (n: number) => plural(n, 'правило', 'правила', 'правил');
