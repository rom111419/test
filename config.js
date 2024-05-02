// Конфигурации для комиссий
module.exports = {
  cashInConfig: {
    percents: 0.03,
    max: {
      amount: 5.00,
      currency: 'EUR',
    },
  },
  cashOutConfigNatural: {
    percents: 0.3,
    weekLimit: {
      amount: 1000.00,
      currency: 'EUR',
    },
  },
  cashOutConfigJuridical: {
    percents: 0.3,
    min: {
      amount: 0.50,
      currency: 'EUR',
    },
  },
};
