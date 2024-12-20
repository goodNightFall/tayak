export const TOKEN_TYPES = {
    Space: "Space",
    Number: "Number",
    Identifier: "Identifier",
    Equal: "Equal",
    Operator: "Operator",
    String: "String",
    Special: "Special",
}

export const REG_EXPS = {
    Space: /^\s+/,
    Number: /^\d+/,
    Identifier: /^[a-zA-Z_][a-zA-Z0-9_]*/,
    Equal: /^=/,
    Operator: /^[+\-*/<>!=]=?|==|<=|>=|&&|\|\|/,
    String: /^"(?:[^"\\]|\\.)*"/,
    Special: /^[,;{}()\[\]]/,
}
