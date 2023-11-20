import {Command} from 'commander'
import main from './text.js'
import { spawnSync, spawn, execSync } from 'node:child_process'

const program = new Command()
program.option('--trial', 'run using third-party public APIs', false)
program.parse()

const o:any = program.opts()
main(o)

spawn('python3', ['./voice.py'], {stdio:'overlapped'})
//execSync('python3 ./voice.py', {stdio:'inherit'})