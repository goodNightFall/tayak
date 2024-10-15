import {
    LEFT_BRACKET,
    operators,
    OperatorsEnum,
    RIGHT_BRACKET,
} from "./constants"
import {
    disallowedSymbolsReg,
    validNumberReg,
    spacesReg,
    validGlobalNumberReg,
    invalidGlobalNumberReg,
    invalidCommaReg,
} from "./regex"

export const prepareString = (string: string) =>
    string.replace(spacesReg, "").replace(/\./g, ",")

export const getDisallowedSymbols = (string: string) =>
    string.match(disallowedSymbolsReg) ?? []

export const isStringAllowed = (string: string) =>
    !getDisallowedSymbols(string).length

export const isValidNumber = (string: string) => validNumberReg.test(string)

export const getNumbersFromPreparedString = (string: string) =>
    string.match(validGlobalNumberReg) ?? []

const getNumberFromIndex = (startIndex: number, string: string) => {
    const subString = string.slice(startIndex)
    const match = subString.match(validGlobalNumberReg)
    return match ? match[0] : null
}

export const isOperator = (symbol: string) =>
    operators.includes(symbol as OperatorsEnum)

export const isLeftBracket = (symbol: string) => symbol === LEFT_BRACKET

export const isRightBracket = (symbol: string) => symbol === RIGHT_BRACKET

export const isBracket = (symbol: string) =>
    isLeftBracket(symbol) || isRightBracket(symbol)

export const isStringHasInvalidNumbers = (string: string) =>
    string.match(invalidGlobalNumberReg) ?? []

export const isStringHasInvalidCommas = (string: string) =>
    string.match(invalidCommaReg)

export const validateExpression = (expression: string) => {
    if (!isStringAllowed(expression))
        throw new Error("Invalid characters usage")

    const correctNumbers = getNumbersFromPreparedString(expression)
    if (!correctNumbers.length) throw new Error("Syntax error")

    if (
        isStringHasInvalidNumbers(expression).length ||
        isStringHasInvalidCommas(expression)
    )
        throw new Error("Expression has invalid numbers")
}

export const parseExpression = (expression: string) => {
    const preparedExpression = prepareString(expression)
    validateExpression(preparedExpression)

    const parsedExpression: string[] = []
    let isPrevLeftBracket = true
    let isPrevOperator = false

    for (let i = 0; i < preparedExpression.length; i++) {
        const symbol = preparedExpression[i]

        if (isOperator(symbol)) {
            if (isPrevOperator)
                throw new Error(`Invalid operator ${symbol} usage`)

            if (isPrevLeftBracket && symbol === "-") {
                if (isLeftBracket(preparedExpression[i + 1])) {
                    parsedExpression.push("0")
                    parsedExpression.push("-")
                    isPrevLeftBracket = false
                    isPrevOperator = true

                    continue
                }

                const number = getNumberFromIndex(i, preparedExpression)

                if (number) {
                    parsedExpression.push(number)
                    isPrevLeftBracket = false
                    isPrevOperator = false
                    i += number.length - 1
                } else {
                    throw new Error("Invalid number format")
                }

                continue
            }

            isPrevOperator = true
            parsedExpression.push(symbol)
            continue
        }

        if (isBracket(symbol)) {
            if (isLeftBracket(symbol)) isPrevLeftBracket = true
            isPrevOperator = false
            parsedExpression.push(symbol)
            continue
        }

        const number = getNumberFromIndex(i, preparedExpression)

        if (number) {
            parsedExpression.push(number)
            isPrevLeftBracket = false
            isPrevOperator = false
            i += number.length - 1
        } else {
            throw new Error("Invalid number format")
        }
    }

    return parsedExpression
}
