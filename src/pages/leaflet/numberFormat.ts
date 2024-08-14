export default function numberFormat(num: number) {
  const str = '千';
  if (num < 1000) {
    return { num, uint: '' };
  }

  return { num: Math.floor(num / 1000), uint: str };
}
