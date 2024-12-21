const fs = require("fs")

/**
 * Парсинг атрибутов из строки тэга
 * @param {string} tag - строка тэга
 * @returns {object} объект с атрибутами
 */
function parseAttributes(tag) {
    const attributes = {}
    const regex = /(\w+)=(["'])(.*?)\2/g
    let match
    while ((match = regex.exec(tag)) !== null) {
        attributes[match[1]] = match[3]
    }
    return attributes
}

/**
 * Валидирует документ на синтаксические и логические ошибки
 * @param {Array} tokens - массив токенов документа
 * @returns {Array} массив ошибок (пустой, если ошибок нет)
 */
function validateDocument(tokens) {
    const errors = []
    const stack = []

    for (const token of tokens) {
        if (token.type === "open") {
            stack.push(token)
        } else if (token.type === "close") {
            const lastOpen = stack.pop()
            if (!lastOpen || lastOpen.name !== token.name) {
                errors.push(`Unexpected closing tag </${token.name}>`)
            }
        }
    }

    if (stack.length > 0) {
        errors.push(`Unclosed tag <${stack.pop().name}>`)
    }

    return errors
}

/**
 * Парсинг документа на eMark
 * @param {string} input - текстовый документ
 * @returns {Array} массив токенов
 */
function parseDocument(input) {
    const regex = /<(\/?\w+)(.*?)>/g
    const tokens = []
    let match

    while ((match = regex.exec(input)) !== null) {
        const isClosing = match[1].startsWith("/")
        const tagName = isClosing ? match[1].slice(1) : match[1]
        const attributes = isClosing ? {} : parseAttributes(match[2])

        tokens.push({
            type: isClosing ? "close" : "open",
            name: tagName,
            attributes,
        })
    }

    return tokens
}

/**
 * Форматирует текст в соответствии с инструкциями eMark
 * @param {Array} tokens - массив токенов
 */
function renderDocument(tokens) {
    console.clear()
    console.log("--- Formatted Document ---")

    for (const token of tokens) {
        if (token.type === "open") {
            if (token.name === "column") {
                console.log(`\n[Column: ${JSON.stringify(token.attributes)}]`)
            } else if (token.name === "row") {
                console.log(`\n[Row: ${JSON.stringify(token.attributes)}]`)
            } else if (token.name === "block") {
                console.log(`\n[Block: ${JSON.stringify(token.attributes)}]`)
            }
        }
    }

    console.log("--- End of Document ---")
}

/**
 * Основная функция запуска процессора
 * @param {string} filePath - путь к файлу документа
 */
function processDocument(filePath) {
    try {
        const input = fs.readFileSync(filePath, "utf-8")
        const tokens = parseDocument(input)

        const errors = validateDocument(tokens)
        if (errors.length > 0) {
            console.error("Errors found in document:")
            errors.forEach((error) => console.error(`- ${error}`))
            return
        }

        renderDocument(tokens)
    } catch (err) {
        console.error(`Error reading file: ${err.message}`)
    }
}

// Запуск программы с указанием входного файла
const inputFilePath = process.argv[2]
if (!inputFilePath) {
    console.error("Usage: node eMarkProcessor.js <file-path>")
} else {
    processDocument(inputFilePath)
}
