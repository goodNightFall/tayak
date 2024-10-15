import {
    OperatorsEnum,
    OperatorsPriority,
    LEFT_BRACKET,
    RIGHT_BRACKET,
    MathFunctions,
} from "./constants"
import { Stack } from "./stack"
import {
    isLeftBracket,
    isOperator,
    isRightBracket,
    isValidNumber,
    parseExpression,
} from "./utils"

export interface ICalculator {
    calculate: (expression: string) => number
}

export class Calculator implements ICalculator {
    constructor() {}

    private isValidNumber(number?: number | null) {
        if (number === null || number === undefined) return false

        return !isNaN(number)
    }

    private plus(left: number, right: number) {
        return left + right
    }

    private minus(left: number, right: number) {
        return left - right
    }

    private multiplication(left: number, right: number) {
        return left * right
    }

    private division(left: number, right: number) {
        if (right === 0) throw new Error("Division by zero")
        return left / right
    }

    private calculateOperation(
        token: OperatorsEnum,
        left: number | null,
        right: number | null
    ) {
        if (!(this.isValidNumber(left) && this.isValidNumber(right)))
            throw new Error(`Invalid operator ${token} usage`)

        switch (token) {
            case OperatorsEnum.Plus: {
                return this.plus(left!, right!)
            }
            case OperatorsEnum.Minus: {
                return this.minus(left!, right!)
            }
            case OperatorsEnum.Multiplication: {
                return this.multiplication(left!, right!)
            }
            case OperatorsEnum.Division: {
                return this.division(left!, right!)
            }
            default: {
                throw new Error("Syntax error")
            }
        }
    }

    private customMathFunction(
        token: MathFunctions,
        left: string,
        right: string
    ) {
        switch (token) {
            case MathFunctions.Pow: {
                return Math.pow(this.calculate(left), this.calculate(right))
            }
            case MathFunctions.Log: {
                return (
                    Math.log(this.calculate(right)) /
                    Math.log(this.calculate(left))
                )
            }
            default: {
                throw new Error("Invalid syntax")
            }
        }
    }

    private infixToPostfix = (tokens: string[]) => {
        const postfixExpression: string[] = []
        const stack = new Stack<string>()

        let bracketCounter = 0

        for (const token of tokens) {
            if (isValidNumber(token)) {
                postfixExpression.push(token)
                continue
            }

            if (isOperator(token)) {
                while (
                    stack.length() > 0 &&
                    OperatorsPriority[token as OperatorsEnum] <=
                        OperatorsPriority[stack.get() as OperatorsEnum]
                ) {
                    postfixExpression.push(stack.pop() as string)
                }

                stack.push(token)
                continue
            }

            if (token === LEFT_BRACKET) {
                bracketCounter += 1
                stack.push(token)
                continue
            }

            if (token === RIGHT_BRACKET) {
                bracketCounter -= 1

                while (stack.length() > 0 && stack.get() !== LEFT_BRACKET) {
                    postfixExpression.push(stack.pop() as string)
                }

                stack.pop()
            }
        }

        while (stack.length() > 0) {
            const stackTop = stack.pop() as string
            if (isLeftBracket(stackTop)) bracketCounter += 1
            if (isRightBracket(stackTop)) bracketCounter -= 1

            postfixExpression.push(stackTop)
        }

        if (bracketCounter > 0) throw new Error("Extra left brackets")
        if (bracketCounter < 0) throw new Error("Extra right brackets")

        return postfixExpression
    }

    private evaluatePostfix(postfixExpression: string[]) {
        const stack = new Stack<number>()

        for (const token of postfixExpression) {
            if (isValidNumber(token)) {
                stack.push(parseFloat(token.replace(",", ".")))
            } else if (isOperator(token)) {
                const b = stack.pop()
                const a = stack.pop()

                if (a === undefined || b === undefined) {
                    throw new Error(`Invalid operator ${token} usage`)
                }

                const result = this.calculateOperation(
                    token as OperatorsEnum,
                    a,
                    b
                )
                stack.push(result!)
            }
        }

        if (stack.length() !== 1) {
            throw new Error("Invalid number format")
        }

        return stack.get()!
    }

    private getCustomFunctionOperands(expression: string): [string, string] {
        let depth: number = 0
        let index: number = 0

        // Проходимся по выражению, чтобы найти разделяющую точку с запятой ';'
        for (let i = 0; i < expression.length; i++) {
            if (expression[i] === "(") depth++
            else if (expression[i] === ")") depth--
            else if (expression[i] === ";" && depth === 0) {
                index = i
                break
            }
        }

        // Возвращаем левый и правый операнды
        return [expression.slice(0, index), expression.slice(index + 1)]
    }

    private getOuterCustomFunction(
        mathFunction: MathFunctions,
        expression: string
    ) {
        const stack = new Stack<string>()
        let startIndex: number = -1

        for (let i = 0; i < expression.length; i++) {
            if (
                expression.slice(i, i + mathFunction.length + 1) ===
                `${mathFunction}${LEFT_BRACKET}`
            ) {
                if (!stack.length()) startIndex = i
                stack.push(mathFunction)
                i += mathFunction.length
                continue
            }

            if (expression[i] === LEFT_BRACKET) {
                stack.push(LEFT_BRACKET)
                continue
            }

            if (expression[i] !== RIGHT_BRACKET) continue

            if (stack.get() === mathFunction) {
                stack.pop()
                if (stack.length()) continue
                return expression.slice(startIndex, i + 1)
            }

            if (stack.get() === LEFT_BRACKET) stack.pop()
        }

        return null
    }

    private calculateCustomFunction = (
        mathFunction: MathFunctions,
        expression: string
    ): string => {
        let match: string | null = this.getOuterCustomFunction(
            mathFunction,
            expression
        )

        while (match) {
            const innerExpression: string = match.slice(
                mathFunction.length + 1,
                -1
            )
            const [left, right]: [string, string] =
                this.getCustomFunctionOperands(innerExpression)

            const leftValue: string = this.calculateCustomFunction(
                mathFunction,
                left.trim()
            )
            const rightValue: string = this.calculateCustomFunction(
                mathFunction,
                right.trim()
            )

            const result: number = this.customMathFunction(
                mathFunction,
                leftValue,
                rightValue
            )

            expression = expression.replace(match, result.toString())

            match = this.getOuterCustomFunction(mathFunction, expression)
        }

        return expression
    }

    calculate(expression: string) {
        const powed: string = this.calculateCustomFunction(
            MathFunctions.Pow,
            expression
        )

        const loged: string = this.calculateCustomFunction(
            MathFunctions.Log,
            powed
        )

        const parsedExpression = parseExpression(loged)
        const postfixExpression = this.infixToPostfix(parsedExpression)
        const calculated = this.evaluatePostfix(postfixExpression)

        return calculated
    }
}
