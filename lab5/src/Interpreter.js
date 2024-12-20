import { ExpressionEvaluator } from "./ExpressionEvaluator.js"
import { ExecutionContext } from "./ExecutionContext.js"
import { PrintHelper } from "./PrintHelper.js"
import { TOKEN_TYPES } from "./constants.js"
import { Tokenizer } from "./Tokenizer.js"
import prompts from "prompts"

class Interpreter {
    async execute(code) {
        const tokens = Tokenizer.tokenize(code).filter(
            (t) => t.type !== TOKEN_TYPES.Space
        )
        const context = new ExecutionContext(tokens)

        try {
            while (context.tokens.length > 0) {
                await this.executeStatement(context)
            }
        } catch (error) {
            console.error(`Execution Error: ${error.message}`)
        }
    }

    async executeStatement(context) {
        if (context.tokens.length === 0) return

        const currentToken = context.tokens.pop()

        switch (currentToken.value) {
            case "if":
                await this.executeIf(context)
                break
            case "for":
                await this.executeFor(context)
                break
            case "print":
                await this.executePrint(context)
                break
            case "scan":
                await this.executeScan(context)
                break
            default:
                if (currentToken.type === TOKEN_TYPES.Identifier) {
                    context.tokens.push(currentToken)
                    this.executeAssignment(context)
                } else {
                    throw new Error(`Unexpected token: ${currentToken.value}`)
                }
                break
        }
    }

    executeAssignment(context) {
        this.ensureTokensExist(context)
        const identifier = context.tokens.pop()
        const equalsToken = context.tokens.pop()

        if (equalsToken.type !== TOKEN_TYPES.Equal)
            throw new Error(`Expected '=', found ${equalsToken.value}`)

        const value = ExpressionEvaluator.evaluateCondition(context)
        context.variables[identifier.value] = value
    }

    async executeScan(context) {
        this.ensureTokensExist(context)
        const identifier = context.tokens.pop()

        if (identifier.type !== TOKEN_TYPES.Identifier)
            throw new Error(`Expected identifier, found ${identifier.value}`)

        const response = await prompts({
            type: "number",
            name: "value",
            message: `Enter ${identifier.value}: `,
        })

        if (isNaN(response.value))
            throw new Error("Invalid input. Expected an integer.")

        context.variables[identifier.value] = response.value

        const semicolon = context.tokens.pop()
        if (semicolon.value !== ";")
            throw new Error(`Expected ';', found ${semicolon.value}`)
    }

    async executePrint(context) {
        const output = PrintHelper.parse(context)
        console.log(output)
    }

    async executeFor(context) {
        this.ensureTokensExist(context)

        const variable = context.tokens.pop()
        const equalsToken = context.tokens.pop()

        if (equalsToken.type !== TOKEN_TYPES.Equal)
            throw new Error(`Expected '=', found ${equalsToken.value}`)

        const startValue = ExpressionEvaluator.evaluateCondition(context)
        const toToken = context.tokens.pop()

        if (toToken.value !== "to")
            throw new Error(`Expected 'to', found ${toToken.value}`)

        const endValue = ExpressionEvaluator.evaluateCondition(context)

        if (context.tokens.pop().value !== "{")
            throw new Error("Expected '{' to start loop body.")

        const loopBody = this.extractBlock(context)

        for (
            context.variables[variable.value] = startValue;
            context.variables[variable.value] <= endValue;
            context.variables[variable.value]++
        ) {
            const loopContext = new ExecutionContext(
                [...loopBody],
                context.variables
            )

            while (loopContext.tokens.length > 0) {
                await this.executeStatement(loopContext)
            }
        }
    }

    async executeIf(context) {
        const condition = ExpressionEvaluator.evaluateBoolCondition(context)

        if (context.tokens.pop().value !== "{")
            throw new Error("Expected '{' to start if body.")

        const ifBody = this.extractBlock(context)

        let elseBody = null
        if (
            context.tokens.length > 0 &&
            context.tokens[context.tokens.length - 1].value === "else"
        ) {
            console.log("in IF")
            context.tokens.pop()

            if (context.tokens.pop().value !== "{")
                throw new Error("Expected '{' to start else body.")

            elseBody = this.extractBlock(context)
        }

        const executionBody = condition ? ifBody : elseBody

        if (executionBody) {
            const conditionalContext = new ExecutionContext(
                executionBody,
                context.variables
            )
            while (conditionalContext.tokens.length > 0) {
                await this.executeStatement(conditionalContext)
            }
        }
    }

    extractBlock(context) {
        const blockTokens = []
        let openBraces = 1

        while (openBraces > 0 && context.tokens.length > 0) {
            const token = context.tokens.pop()

            if (token.value === "{") openBraces++
            if (token.value === "}") openBraces--

            if (openBraces > 0) blockTokens.push(token)
        }

        if (openBraces > 0) throw new Error("Missing closing '}' in block.")

        return blockTokens
    }

    ensureTokensExist(context) {
        if (context.tokens.length === 0)
            throw new Error("Unexpected end of input.")
    }
}

export { Interpreter }
