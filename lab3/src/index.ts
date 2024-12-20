import * as fs from "fs"
import * as path from "path"
import * as readline from "readline"

interface Fargs {
    s: string
    p: string
    h: string
}

interface Value {
    s: string
    c: string
}

class Link {
    s: string
    inp: string
    stack: string
    index: number
    term: boolean

    constructor(s: string, inp: string, stack: string, term: boolean = false) {
        this.s = s
        this.inp = inp
        this.stack = stack
        this.index = -1
        this.term = term
    }
}

class Command {
    f: Fargs
    values: Value[]

    constructor(f: Fargs, values: Value[]) {
        this.f = f
        this.values = values
    }
}

class Storage {
    P: Set<string>
    H: Set<string>
    s0: string
    h0: string
    emptySymbol: string
    commands: Command[]
    chain: Link[]

    constructor() {
        this.P = new Set()
        this.H = new Set()
        this.s0 = "0"
        this.h0 = "|"
        this.emptySymbol = ""
        this.commands = []
        this.chain = []

        const absolutePath = path.resolve(__dirname, "../files/test1.txt") // Абсолютный путь к файлу

        try {
            const fileContent = fs.readFileSync(absolutePath, "utf-8")
            const pattern = /([A-Z])>([^\|]+(?:\|[^\|]+)*)/
            const lines = fileContent.split("\n")

            for (const line of lines) {
                const trimmedLine = line.trim()
                if (!trimmedLine) continue

                const match = pattern.exec(trimmedLine)
                if (!match) {
                    throw new Error("Не удалось распознать содержимое файла")
                }

                const [_, symbol, transitions] = match
                this.H.add(symbol)
                const command = new Command(
                    { s: this.s0, p: this.emptySymbol, h: symbol },
                    []
                )
                const values = transitions.split("|")
                for (const val of values) {
                    this.P.add(val)
                    command.values.push({
                        s: this.s0,
                        c: val.split("").reverse().join(""),
                    })
                }
                this.commands.push(command)
            }

            for (const c of this.H) {
                this.P.delete(c)
            }

            for (const c of this.P) {
                this.commands.push(
                    new Command({ s: this.s0, p: c, h: c }, [
                        { s: this.s0, c: this.emptySymbol },
                    ])
                )
            }
            this.commands.push(
                new Command({ s: this.s0, p: this.emptySymbol, h: this.h0 }, [
                    { s: this.s0, c: this.emptySymbol },
                ])
            )
        } catch (err) {
            throw new Error(
                `Не удалось открыть файл для чтения: ${absolutePath}`
            )
        }
    }

    showInfo(): void {
        console.log(
            "Входной алфавит:\nP = {",
            Array.from(this.P).join(", "),
            "}\n"
        )
        console.log(
            "Алфавит магазинных символов:\nZ = {",
            [...this.H, ...this.P].join(", "),
            ", h0}\n"
        )
        console.log("Список команд:")
        for (const cmd of this.commands) {
            const p = cmd.f.p === this.emptySymbol ? "lambda" : cmd.f.p
            const h = cmd.f.h === this.h0 ? "h0" : cmd.f.h
            const valuesStr = cmd.values
                .map(
                    (v) =>
                        `(s${v.s}, ${
                            v.c === this.emptySymbol ? "lambda" : v.c
                        })`
                )
                .join("; ")
            console.log(`f(s${cmd.f.s}, ${p}, ${h}) = {${valuesStr}}`)
        }
    }

    showChain(): void {
        console.log("\nЦепочка конфигураций: ")
        for (const link of this.chain) {
            const inpStr = link.inp || "lambda"
            console.log(`(s${link.s}, ${inpStr}, h0${link.stack}) |– `)
        }
        console.log("(s0, lambda, lambda)")
    }

    pushLink(): boolean {
        const chSize = this.chain.length
        for (const cmd of this.commands) {
            const magSize = this.chain[this.chain.length - 1].stack.length
            const lastLink = this.chain[this.chain.length - 1]
            if (
                lastLink.inp &&
                lastLink.stack &&
                lastLink.s === cmd.f.s &&
                (lastLink.inp[0] === cmd.f.p || cmd.f.p === this.emptySymbol) &&
                lastLink.stack[lastLink.stack.length - 1] === cmd.f.h
            ) {
                for (const val of cmd.values) {
                    const newLink = new Link(
                        val.s,
                        lastLink.inp,
                        lastLink.stack
                    )
                    if (cmd.f.p !== this.emptySymbol) {
                        newLink.inp = newLink.inp.slice(1)
                    }

                    newLink.stack = newLink.stack.slice(0, -1) + val.c
                    this.chain.push(newLink)

                    if (newLink.inp.length < newLink.stack.length) {
                        this.chain.pop()
                        continue
                    }

                    if ((!newLink.inp && !newLink.stack) || this.pushLink()) {
                        return true
                    }
                }

                this.chain.pop()
                return false
            }
        }
        return false
    }

    checkLine(inputStr: string): boolean {
        if (this.commands[0].values.length === 1) {
            this.chain.push(new Link(this.s0, inputStr, "", false))
        } else {
            this.chain.push(new Link(this.s0, inputStr, "", true))
        }

        this.chain[0].stack += this.commands[0].f.h
        const result = this.pushLink()

        if (result) {
            console.log("Валидная строка")
            this.showChain()
        } else {
            console.log("Невалидная строка")
        }

        this.chain = []
        return result
    }
}

// Main execution
try {
    const storage = new Storage()
    storage.showInfo()
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    const processInput = () => {
        rl.question("Введите строку: ", (userInput) => {
            storage.checkLine(userInput)
            console.log()
            processInput()
        })
    }

    processInput()
} catch (e: any) {
    console.error(e.message)
}
