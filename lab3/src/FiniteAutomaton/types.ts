export type StateType = string
export type TransitionType = Record<string, StateType | StateType[]>
export type AutomatonType = Record<StateType, TransitionType>

export interface IFiniteAutomaton {
    print: () => void
    parseTransitions: (lines: string[]) => void
    getCurrentState: () => StateType
    getNextState: (
        currentState: StateType,
        symbol: string
    ) => StateType | StateType[] | null
    isFinalState: (state: StateType) => boolean
    isDeterministic: () => boolean
}
