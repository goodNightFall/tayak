class ExecutionContext {
    constructor(tokens, variables = {}) {
        this.tokens = tokens.reverse()
        this.variables = variables
    }
}

export { ExecutionContext }
