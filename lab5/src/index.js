import fs from "fs"
import { Interpreter } from "./Interpreter.js"

const code = fs.readFileSync("./Code.txt", "utf-8")

const interpreter = new Interpreter()

interpreter.execute(code)
