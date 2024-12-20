import path from "path"
import { FiniteAutomaton } from "./FiniteAutomaton"

const filePath = path.resolve(__dirname, "../files/2.txt")

const automaton = new FiniteAutomaton(filePath)
// const testString = "aa+cd*=357"
automaton.print()

// console.log(
//     'Next state from q0 with symbol "\\":',
//     automaton.getNextState("q0", "\\")
// )
// console.log("Is f2 a final state?", automaton.isFinalState("f2"))
// const result = automaton.processString(testString)
// console.log(
//     `String "${testString}" is ${
//         result ? "accepted" : "rejected"
//     } by the automaton.`
// )
console.log("isDeterministic:", automaton.isDeterministic())
console.log("getAlphabet:", automaton.getAlphabet())
console.log("==============================================")
automaton.determinize()
automaton.print()
console.log("isDeterministic:", automaton.isDeterministic())
