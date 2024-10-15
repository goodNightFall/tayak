export enum OperatorsEnum {
    Plus = "+",
    Minus = "-",
    Multiplication = "*",
    Division = "/",
}

export enum MathFunctions {
    Pow = "pow",
    Log = "log",
}

export const LEFT_BRACKET = "("
export const RIGHT_BRACKET = ")"
export const SPACE = " "

export const operators = Object.values(OperatorsEnum)

export const OperatorsPriority: Readonly<Record<OperatorsEnum, number>> = {
    [OperatorsEnum.Plus]: 1,
    [OperatorsEnum.Minus]: 1,
    [OperatorsEnum.Multiplication]: 2,
    [OperatorsEnum.Division]: 2,
}
