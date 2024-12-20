import { Tokenizer } from "./Tokenizer.js"
import { TOKEN_TYPES } from "./constants.js"

class ExpressionEvaluator {
    static evaluate(context) {
        const curToken = context.tokens.pop()

        if (curToken.type === TOKEN_TYPES.Number)
            return parseInt(curToken.value, 10)

        if (
            curToken.type === TOKEN_TYPES.Identifier &&
            context.variables[curToken.value] !== undefined
        )
            return context.variables[curToken.value]

        throw new Error(`Invalid expression: ${curToken.value}`)
    }

    static evaluateBoolCondition(context) {
        const left = this.evaluate(context)
        const op = context.tokens.pop()
        const right = this.evaluate(context)

        if (op.type === TOKEN_TYPES.Operator) {
            switch (op.value) {
                case "==":
                    return left == right
                case "!=":
                    return left != right
                case "<":
                    return left < right
                case ">":
                    return left > right
                case "<=":
                    return left <= right
                case ">=":
                    return left >= right
                default:
                    throw new Error(`Invalid operator: ${op.value}`)
            }
        }

        context.tokens.push(Tokenizer.createToken(right))
        context.tokens.push(op)
        context.tokens.push(Tokenizer.createToken(left))

        throw new Error(`Invalid operator: ${op.value}`)
    }

    static evaluateCondition(context) {
        if (context.tokens.length > 2) {
            const left = this.evaluate(context)
            const op = context.tokens.pop()

            if (op.type === TOKEN_TYPES.Operator) {
                const right = this.evaluate(context)
                switch (op.value) {
                    case "*":
                        return left * right
                    case "+":
                        return left + right
                    case "-":
                        return left - right
                    case "/":
                        return left / right
                    default:
                        throw new Error(`Invalid operator: ${op.value}`)
                }
            }

            context.tokens.push(op)
            context.tokens.push(Tokenizer.createToken(left))
        }

        return this.evaluate(context)
    }
}

export { ExpressionEvaluator }
