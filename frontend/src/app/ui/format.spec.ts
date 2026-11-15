import { formatAmount } from './format';

describe('formatAmount', () => {
  it('groups thousands with the separator and keeps the decimals', () => {
    expect(formatAmount(10874.59, 2, ' ')).toBe('10 874.59');
  });

  it('leaves out the fraction when there are no decimals', () => {
    expect(formatAmount(1184, 0, ',')).toBe('1,184');
  });

  it('does not group a number below a thousand', () => {
    expect(formatAmount(13, 0, ' ')).toBe('13');
  });
});
