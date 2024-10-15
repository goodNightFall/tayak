export const disallowedSymbolsReg = /[^0-9+\-*/(),.\s]/g

export const validNumberReg = /^(?:-?(?:[1-9]\d*|0)(?:,\d+)?)$/

export const validGlobalNumberReg = /-?(?:[1-9]\d*|0)(?:,\d+)?/g

export const invalidGlobalNumberReg =
    /-?(?:[1-9]\d*|0),[^0-9]|-?(?:[1-9]\d*|0)(?:,[0-9]+){2,}|-?(?:[1-9]\d*|0),$/

export const invalidCommaReg =
    /.*[+\-*/)()]+,|,[+\-*/)()]+.*|^[+\-*/]*,|,[+\-*/]*$/g

export const spacesReg = /\s+/g
