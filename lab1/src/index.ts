import { Calculator } from "./calculator"

import { createInterface } from "readline"
import { parseExpression, prepareString, validateExpression } from "./utils"

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
})

const calculator = new Calculator()
console.clear()
console.log("Введите выражение: ")
rl.on("line", (input) => {
    try {
        console.log(calculator.calculate(input))
    } catch (e: any) {
        console.error(e.message)
    }

    console.log("Введите выражение: ")
})

// export const invalidCommaReg = /.*[+\-*/(]+,|,[+\-*/)()]+.*/g

// console.log(prepareString(",2 + (.5 + 0,5)"))
