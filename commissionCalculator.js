const { roundUp } = require('./utils');
const { cashInConfig, cashOutConfigNatural, cashOutConfigJuridical } = require('./config');

class CommissionCalculator {
  constructor() {
    this.naturalCashOuts = {};
  }

  calculate(operation) {
    switch (operation.type) {
      case 'cash_in':
        return this.calculateCashIn(operation.operation.amount);
      case 'cash_out':
        return this.calculateCashOut(operation);
      default:
        return 0;
    }
  }

  calculateCashIn(amount) {
    const fee = Math.min((amount * cashInConfig.percents) / 100, cashInConfig.max.amount);
    return roundUp(fee);
  }

  calculateCashOut(operation) {
    const { user_type, operation: { amount } } = operation;
    if (user_type === 'natural') {
      return this.calculateCashOutNatural(operation);
    } if (user_type === 'juridical') {
      return this.calculateCashOutJuridical(amount);
    }
    return 0;
  }

  calculateCashOutNatural(operation) {
    const { user_id, date, operation: { amount } } = operation;
    const weekOfYear = this.getWeekOfYear(date);

    if (!this.naturalCashOuts[user_id]) {
      this.naturalCashOuts[user_id] = {};
    }

    if (!this.naturalCashOuts[user_id][weekOfYear]) {
      this.naturalCashOuts[user_id][weekOfYear] = { amount: 0, limitUsed: 0 };
    }

    let fee = 0;
    const weekInfo = this.naturalCashOuts[user_id][weekOfYear];
    const newTotal = weekInfo.amount + amount;

    if (weekInfo.amount < cashOutConfigNatural.weekLimit.amount) {
      if (newTotal > cashOutConfigNatural.weekLimit.amount) {
        // Calculate fee only on the amount that exceeds the free limit
        const taxableAmount = newTotal - cashOutConfigNatural.weekLimit.amount;
        fee = (taxableAmount * cashOutConfigNatural.percents) / 100;
      }
    } else {
      fee = (amount * cashOutConfigNatural.percents) / 100;
    }

    weekInfo.amount = newTotal;
    return roundUp(fee);
  }

  calculateCashOutJuridical(amount) {
    const fee = Math.max((amount * cashOutConfigJuridical.percents) / 100, cashOutConfigJuridical.min.amount);
    return roundUp(fee);
  }

  getWeekOfYear(dateStr) {
    const date = new Date(dateStr);
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000 + 1;
    return Math.ceil(pastDaysOfYear / 7);
  }
}

module.exports = CommissionCalculator;
