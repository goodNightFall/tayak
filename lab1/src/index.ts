import { Calculator } from "./calculator"

const calculator = new Calculator()

console.log(
    calculator.calculate(
        "-pow(1 + 1; 1 + 1) + log(3 - 1; pow(2; pow((2 + 2) / 2; 2 * 1)))"
    )
)
