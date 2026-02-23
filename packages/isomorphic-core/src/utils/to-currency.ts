export function toCurrency(
  number: number | string,
  disableDecimal = false,
  decimalPlaces = 2,
  locale = 'en-US',
  currency = 'USD'
) {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: disableDecimal ? 0 : decimalPlaces,
    maximumFractionDigits: disableDecimal ? 0 : decimalPlaces,
  });
  return formatter.format(+number);
}
