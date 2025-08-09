import { Command } from "commander"
import main from "./text.js"
import { execSync, spawn } from "node:child_process"

const program = new Command()
//program.option('--trial', 'run using third-party public APIs', false)
program.option(
  "--icebreaker [sentence]",
  "first sentence to spark the conversation",
  `Let's talk about Bangladesh!`,
)
program.parse()

const o: any = program.opts()
main(o)

//spawn('python3', ['./voice.py'], {stdio:'pipe'})

//const p = execSync('pyenv prefix venv').toString().replace(/\n$/, '')
//spawn(p+'/bin/python3.11', ['./voice.py'], {stdio:'pipe'})
