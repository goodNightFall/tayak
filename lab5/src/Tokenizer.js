import { TOKEN_TYPES, REG_EXPS } from "./constants.js"

class Tokenizer {
    static tokenize(code) {
        const tokens = []
        const tokenPatterns = [
            { type: TOKEN_TYPES.Space, regex: REG_EXPS.Space },
            { type: TOKEN_TYPES.Number, regex: REG_EXPS.Number },
            { type: TOKEN_TYPES.Identifier, regex: REG_EXPS.Identifier },
            { type: TOKEN_TYPES.Equal, regex: REG_EXPS.Equal },
            { type: TOKEN_TYPES.Operator, regex: REG_EXPS.Operator },
            { type: TOKEN_TYPES.String, regex: REG_EXPS.String },
            { type: TOKEN_TYPES.Special, regex: REG_EXPS.Special },
        ]

        while (code.length > 0) {
            let match = null

            for (const { type, regex } of tokenPatterns) {
                match = code.match(regex)
                if (match) {
                    tokens.push({ type, value: match[0] })
                    code = code.slice(match[0].length)
                    break
                }
            }

            if (!match) {
                throw new Error(`Unexpected token at: ${code}`)
            }
        }

        return tokens
    }

    static createToken = (value) => {
        return Tokenizer.tokenize(`${value}`).pop()
    }
}

export { Tokenizer }
