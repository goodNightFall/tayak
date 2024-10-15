import { Calculator } from "../src/calculator"

describe("Calculator edge case tests", () => {
    const calculator = new Calculator()

    const testCases = [
        { expression: "10 / 0", expectedError: "Division by zero" },
        { expression: "-10 / 0", expectedError: "Division by zero" },
        { expression: "2 + a", expectedError: "Invalid characters usage" },
        { expression: "5 @ 3", expectedError: "Invalid characters usage" },
        { expression: "5 ++ 2", expectedError: "Invalid operator + usage" },
        { expression: "3 -- 4", expectedError: "Invalid operator - usage" },
        { expression: "8 ** 3", expectedError: "Invalid operator * usage" },
        { expression: "(1 + 2", expectedError: "Extra left brackets" },
        { expression: "1 + 2)", expectedError: "Extra right brackets" },
        { expression: "((1 + 2) * 3", expectedError: "Extra left brackets" },
        { expression: "1 + (2 * 3))", expectedError: "Extra right brackets" },
        { expression: "2 * -3", expectedError: "Invalid operator - usage" },
        { expression: "-2 + -3", expectedError: "Invalid operator - usage" },
        { expression: "-5 * (-4)", expectedResult: 20 },
        { expression: "5 + -(-2)", expectedError: "Invalid operator - usage" },
        { expression: "5 * ()", expectedError: "Invalid operator * usage" },
        { expression: "() + 2", expectedError: "Invalid operator + usage" },
        {
            expression: "1,2.3 + 4",
            expectedError: "Expression has invalid numbers",
        },
        {
            expression: "5..6 - 7",
            expectedError: "Expression has invalid numbers",
        },
        {
            expression: "2,,,5 + 3",
            expectedError: "Expression has invalid numbers",
        },
        {
            expression: "3 + 'string'",
            expectedError: "Invalid characters usage",
        },
        { expression: "true + 4", expectedError: "Invalid characters usage" },
        { expression: "+ 5", expectedError: "Invalid operator + usage" },
        { expression: "* 3", expectedError: "Invalid operator * usage" },
        { expression: "5 /", expectedError: "Invalid operator / usage" },
        {
            expression: "",
            expectedError: "Syntax error",
        },
        {
            expression: "1,23,4 + 5",
            expectedError: "Expression has invalid numbers",
        },
        {
            expression: "4..56 * 2",
            expectedError: "Expression has invalid numbers",
        },
        { expression: "1,", expectedError: "Expression has invalid numbers" },
        {
            expression: "1, + 1",
            expectedError: "Expression has invalid numbers",
        },
        {
            expression: "1, + 1 +",
            expectedError: "Expression has invalid numbers",
        },
        { expression: "5 - - - 3", expectedError: "Invalid operator - usage" },
        { expression: "6 - ---4", expectedError: "Invalid operator - usage" },
        {
            expression: "(",
            expectedError: "Syntax error",
        },
        {
            expression: ")",
            expectedError: "Syntax error",
        },
        {
            expression: "+",
            expectedError: "Syntax error",
        },
        { expression: "NaN + 5", expectedError: "Invalid characters usage" },
        {
            expression: "undefined * 2",
            expectedError: "Invalid characters usage",
        },
        { expression: "null - 3", expectedError: "Invalid characters usage" },
        { expression: "-10 / -2", expectedError: "Invalid operator - usage" },
        { expression: "-10 / 2", expectedResult: -5 },
        { expression: "1", expectedResult: 1 },
        {
            expression: "5 + (3 * -2) / 0",
            expectedError: "Invalid operator - usage",
        },
        {
            expression: "(1 + 2) * (3 - 4))",
            expectedError: "Extra right brackets",
        },
    ]

    testCases.forEach(({ expression, expectedError, expectedResult }) => {
        if (expectedError) {
            test(`should throw an error for expression: ${expression}`, () => {
                expect(() => calculator.calculate(expression)).toThrow(
                    expectedError
                )
            })
        } else {
            test(`should calculate correctly for expression: ${expression}`, () => {
                expect(calculator.calculate(expression)).toBe(expectedResult)
            })
        }
    })
})
