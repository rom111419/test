const CommissionCalculator = require('./commissionCalculator');
const { cashInConfig, cashOutConfigNatural, cashOutConfigJuridical } = require('./config');

describe('CommissionCalculator', () => {
  let calculator;

  beforeEach(() => {
    // Сброс состояния для каждого теста
    calculator = new CommissionCalculator();
  });


  test('Cash in commission should not exceed maximum', () => {
    const operation = { type: 'cash_in', operation: { amount: 100000 } };
    const expectedMaxFee = cashInConfig.max.amount;
    expect(calculator.calculate(operation)).toEqual(expectedMaxFee);
  });

  // Тесты для юридических лиц при выводе наличных
  test('Cash out commission for juridical should not be less than minimum', () => {
    const operation = { user_type: 'juridical', type: 'cash_out', operation: { amount: 100 } };
    const expectedMinFee = cashOutConfigJuridical.min.amount;
    expect(calculator.calculate(operation)).toEqual(expectedMinFee);
  });

  describe('Cash out for natural persons', () => {
    test('No commission should be charged for the first 1000 EUR per week', () => {
      const operation = {
        date: '2020-01-01', user_id: 1, user_type: 'natural', type: 'cash_out', operation: { amount: 1000 },
      };
      expect(calculator.calculate(operation)).toEqual(0);
    });

    test('Commission should be charged only on the amount that exceeds 1000 EUR in a week', () => {

      calculator.calculate({
        date: '2020-01-01', user_id: 1, user_type: 'natural', type: 'cash_out', operation: { amount: 1000 },
      });
      const operation = {
        date: '2020-01-02', user_id: 1, user_type: 'natural', type: 'cash_out', operation: { amount: 500 },
      };
      const expectedFee = (500 * cashOutConfigNatural.percents) / 100;
      expect(calculator.calculate(operation)).toBeCloseTo(expectedFee);
    });

    test('Commission should be charged for all amount if weekly limit is already exceeded', () => {
      calculator.calculate({
        date: '2020-01-01', user_id: 1, user_type: 'natural', type: 'cash_out', operation: { amount: 1100 },
      });
      const operation = {
        date: '2020-01-02', user_id: 1, user_type: 'natural', type: 'cash_out', operation: { amount: 100 },
      };
      const expectedFee = (100 * cashOutConfigNatural.percents) / 100;
      expect(calculator.calculate(operation)).toBeCloseTo(expectedFee);
    });
  });
});
