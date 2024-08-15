export default function numberFormat(num: number) {
  const str = '万';
  if (num < 1000000) {
    return { num, uint: '' };
  }

  return { num: Math.floor(num / 10000), uint: str };
}
