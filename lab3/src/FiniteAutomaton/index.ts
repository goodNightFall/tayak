import { AutomatonType, IFiniteAutomaton, StateType } from "./types"
import fs from "fs"

export class FiniteAutomaton implements IFiniteAutomaton {
    private transitions: AutomatonType = {}
    private finalStates: Set<StateType> = new Set()
    private startState: StateType = "q0"

    constructor(filename: string) {
        const lines = fs
            .readFileSync(filename, "utf-8")
            .split("\n")
            .map((line) => line.trim())

        this.parseTransitions(lines)
    }

    parseTransitions(lines: string[]): void {
        const transitionRegex = /^q(\d+),(.+)=([qf])(\d+)$/

        lines.forEach((line) => {
            if (!line) return // Пропустить пустые строки
            const match = transitionRegex.exec(line)
            if (!match) {
                throw new Error(`Invalid transition format: ${line}`)
            }

            const [, fromStateNum, symbol, toType, toStateNum] = match
            const fromState = `q${fromStateNum}`
            const toState = `${toType}${toStateNum}`

            // Если переход ведет в конечное состояние, сохраняем его
            if (toType === "f") {
                this.finalStates.add(toState)
            }

            // Добавляем переход в граф
            if (!this.transitions[fromState]) {
                this.transitions[fromState] = {}
            }

            // Если для символа перехода уже существует, преобразуем его в массив
            if (!this.transitions[fromState][symbol]) {
                this.transitions[fromState][symbol] = toState
            } else {
                // Если переход уже существует, добавляем в массив
                const existing = this.transitions[fromState][symbol]
                if (Array.isArray(existing)) {
                    existing.push(toState)
                } else {
                    // Если это строка, преобразуем в массив
                    this.transitions[fromState][symbol] = [existing, toState]
                }
            }
        })
    }

    print() {
        console.log("Transitions:")
        console.log(JSON.stringify(this.transitions, null, 2))
        console.log("Final States:", Array.from(this.finalStates))
    }

    getCurrentState() {
        return "123"
    }

    // Метод для получения начального состояния
    getStartState(): string {
        return this.startState
    }

    getNextState(
        currentState: StateType,
        symbol: string
    ): StateType | StateType[] | null {
        const transition = this.transitions[currentState]?.[symbol]
        if (!transition) return null
        return Array.isArray(transition) ? transition : [transition] // Возвращаем массив состояний
    }

    isFinalState(state: StateType): boolean {
        return this.finalStates.has(state)
    }

    public processString(input: string): boolean {
        let currentStates: StateType[] = [this.startState] // Массив состояний для NFA

        for (const char of input) {
            const nextStates: StateType[] = []

            // Проходим по всем текущим состояниям
            for (const state of currentStates) {
                const transitions = this.getNextState(state, char)

                if (transitions) {
                    // Если переходы есть, добавляем их в следующий шаг
                    if (Array.isArray(transitions)) {
                        nextStates.push(...transitions)
                    } else {
                        nextStates.push(transitions)
                    }
                }
            }

            if (nextStates.length === 0) {
                console.log(
                    `No transition from states "${currentStates.join(
                        ", "
                    )}" with symbol "${char}"`
                )
                return false // Нет переходов для символа
            }

            console.log(
                `Transitions: ${currentStates.join(
                    ", "
                )} --${char}--> ${nextStates.join(", ")}`
            )
            currentStates = nextStates // Обновляем текущие состояния
        }

        // Проверяем, есть ли среди текущих состояний конечные
        const isAccepted = currentStates.some((state) =>
            this.isFinalState(state)
        )
        console.log(
            `Final states: ${currentStates.join(", ")}, Accepted: ${isAccepted}`
        )
        return isAccepted
    }

    public isDeterministic(): boolean {
        for (const state in this.transitions) {
            for (const symbol in this.transitions[state]) {
                const transition = this.transitions[state][symbol]

                // Если для одного символа есть несколько переходов — это NFA
                if (Array.isArray(transition) && transition.length > 1) {
                    return false
                }
            }
        }
        return true
    }

    // Метод для детерминизации автомата
    determinize(): void {
        const dfaTransitions: AutomatonType = {}
        const dfaFinalStates: Set<StateType> = new Set()
        const dfaStates: Set<string> = new Set() // Множество для уникальных состояний DFA
        const stateQueue: Set<string> = new Set() // Очередь состояний для обработки

        // Начальное состояние DFA - это просто начальное состояние NFA
        const initialState = this.getStartState()
        const initialDFAStateName = `${initialState}` // Начальное состояние DFA
        stateQueue.add(initialDFAStateName)
        dfaStates.add(initialDFAStateName)

        // Для каждого множества состояний в DFA
        while (stateQueue.size > 0) {
            const currentState = stateQueue.values().next().value
            stateQueue.delete(currentState!)

            // Для каждого символа из алфавита
            for (const symbol of Array.from(this.getAlphabet())) {
                const nextStates: Set<string> = new Set()

                // Разбиваем текущее состояние на составляющие (если оно содержит несколько состояний)
                const currentStates = currentState!.split(",")

                // Собираем все возможные переходы для каждого состояния
                for (const state of currentStates) {
                    const transition = this.transitions[state]?.[symbol]
                    if (transition) {
                        if (Array.isArray(transition)) {
                            transition.forEach((toState) =>
                                nextStates.add(toState)
                            )
                        } else {
                            nextStates.add(transition)
                        }
                    }
                }

                // Если есть переходы, создаем новое состояние в DFA
                if (nextStates.size > 0) {
                    const nextState = Array.from(nextStates).sort().join(",")

                    // Обновляем переходы
                    if (!dfaTransitions[currentState!]) {
                        dfaTransitions[currentState!] = {}
                    }
                    dfaTransitions[currentState!][symbol] = nextState

                    // Если новое состояние не добавлено в dfaStates, добавляем его в очередь
                    if (!dfaStates.has(nextState)) {
                        dfaStates.add(nextState)
                        stateQueue.add(nextState)
                    }

                    // Если среди состояний NFA, которые формируют новое состояние DFA, есть конечное, то и это состояние DFA тоже конечное
                    if (
                        Array.from(nextStates).some((state) =>
                            this.isFinalState(state)
                        )
                    ) {
                        dfaFinalStates.add(nextState)
                    }
                }
            }
        }

        // Обновляем переходы и финальные состояния для DFA
        this.transitions = dfaTransitions
        this.finalStates = dfaFinalStates
        this.startState = initialDFAStateName
    }

    getAlphabet(): Set<string> {
        const alphabet = new Set<string>()

        // Проходим по всем переходам
        for (const fromState in this.transitions) {
            for (const symbol in this.transitions[fromState]) {
                // Добавляем символ в множество
                alphabet.add(symbol)
            }
        }

        return alphabet
    }
}
