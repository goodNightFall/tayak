export interface IStack<T> {
    pop: () => T | null
    push: (value: T) => void
    get: () => T | null
    length: () => number
    print: () => void
}

export class Stack<T> implements IStack<T> {
    private stack: T[]

    constructor() {
        this.stack = new Array<T>()
    }

    pop() {
        return this.stack.pop() ?? null
    }

    push(value: T) {
        this.stack.push(value)
    }

    get() {
        return this.stack.at(-1) ?? null
    }

    length() {
        return this.stack.length
    }

    print() {
        console.log(this.stack)
    }
}
