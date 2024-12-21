const fs = require("fs")

/**
 * Парсинг атрибутов из строки тэга
 * @param {string} tag - строка тэга
 * @returns {object} объект с атрибутами
 */
function parseAttributes(tag) {
    const attributes = {}
    const regex = /(\w+)=(['"])(.*?)\2/g
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
    const regex = /<(\/?\w+)(.*?)>|([^<]+)/g
    const tokens = []
    let match

    while ((match = regex.exec(input)) !== null) {
        if (match[1]) {
            // Тег
            const isClosing = match[1].startsWith("/")
            const tagName = isClosing ? match[1].slice(1) : match[1]
            const attributes = isClosing ? {} : parseAttributes(match[2])
            tokens.push({
                type: isClosing ? "close" : "open",
                name: tagName,
                attributes,
            })
        } else if (match[3] && match[3].trim()) {
            // Текст внутри тега
            tokens.push({
                type: "text",
                content: match[3].trim(),
            })
        }
    }

    return tokens
}

/**
 * Применяет выравнивание текста
 * @param {string} text - текст
 * @param {number} width - ширина столбца
 * @param {string} alignment - выравнивание (left, center, right)
 * @returns {string} выровненный текст
 */
function alignText(text, width, alignment) {
    if (alignment === "center") {
        const padding = Math.max(0, Math.floor((width - text.length) / 2))
        return (
            " ".repeat(padding) +
            text +
            " ".repeat(width - text.length - padding)
        )
    } else if (alignment === "right") {
        return " ".repeat(Math.max(0, width - text.length)) + text
    } else {
        return text + " ".repeat(Math.max(0, width - text.length))
    }
}

/**
 * Устанавливает цвета текста и фона
 * @param {string} text - текст
 * @param {number} textColor - цвет текста (0-15)
 * @param {number} bgColor - цвет фона (0-15)
 * @returns {string} текст с цветами
 */
function colorizeText(text, textColor, bgColor) {
    const textColorCode = `\x1b[38;5;${textColor}m`
    const bgColorCode = `\x1b[48;5;${bgColor}m`
    const resetCode = "\x1b[0m"
    return `${bgColorCode}${textColorCode}${text}${resetCode}`
}

/**
 * Форматирует текст в соответствии с инструкциями eMark
 * @param {Array} tokens - массив токенов
 */
function renderDocument(tokens) {
    const output = Array(24)
        .fill("")
        .map(() => Array(80).fill(" ")) // 24 строки по 80 символов
    let currentRow = 0
    let currentCol = 0
    let currentWidth = 80
    let currentHeight = 1

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]

        if (token.type === "open") {
            if (token.name === "block") {
                // Устанавливаем размеры блока
                currentRow = 0
                currentCol = 0
                currentWidth = parseInt(token.attributes.columns) || 80
            } else if (token.name === "row") {
                // Начинаем новую строку
                currentRow++
                currentCol = 0
                currentHeight = parseInt(token.attributes.height) || 1
            } else if (token.name === "column") {
                // Устанавливаем ширину столбца
                currentWidth = parseInt(token.attributes.width) || 10
            }
        } else if (token.type === "text") {
            // Вставляем текст с выравниванием и цветами
            const textAlign = tokens[i - 1]?.attributes?.halign || "left"
            const textColor =
                parseInt(tokens[i - 1]?.attributes?.textcolor) || 15
            const bgColor = parseInt(tokens[i - 1]?.attributes?.bgcolor) || 0
            const alignedText = alignText(
                token.content,
                currentWidth,
                textAlign
            )
            const coloredText = colorizeText(alignedText, textColor, bgColor)

            for (let j = 0; j < currentHeight; j++) {
                if (currentRow + j < 24) {
                    const line = output[currentRow + j]
                    for (let k = 0; k < alignedText.length; k++) {
                        if (currentCol + k < 80) {
                            line[currentCol + k] = coloredText[k] || " "
                        }
                    }
                }
            }
            currentCol += currentWidth
        }
    }

    console.log("--- Formatted Document ---")
    for (const line of output) {
        console.log(line.join(""))
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
