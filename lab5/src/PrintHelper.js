import { TOKEN_TYPES } from "./constants.js"
import { ExpressionEvaluator } from "./ExpressionEvaluator.js"

class PrintHelper {
    static parse(context) {
        const token = context.tokens.pop()

        if (token.type === TOKEN_TYPES.String) {
            let bufStr = token.value.replace(/^"|"$/g, "")
            const checkToken = context.tokens.pop()
            if (checkToken?.value === ",") {
                bufStr += ExpressionEvaluator.evaluateCondition(context)
            } else {
                if (checkToken) context.tokens.push(checkToken)
            }
            return bufStr
        }

        context.tokens.push(token)
        return ExpressionEvaluator.evaluateCondition(context).toString()
    }
}

export { PrintHelper }
