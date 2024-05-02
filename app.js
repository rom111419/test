const fs = require('fs');
const CommissionCalculator = require('./commissionCalculator');

function main() {
  const filePath = process.argv[2]; // Получение пути файла из аргумента командной строки
  const inputData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const calculator = new CommissionCalculator();

  inputData.forEach((operation) => {
    const fee = calculator.calculate(operation);
    console.log(fee.toFixed(2));
  });
}

main();
