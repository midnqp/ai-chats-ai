import axios from 'axios'
import express from 'express'
import boxen from 'boxen'
import { env as ENV } from 'node:process'

type Person = {
    color: string,
    name: string,
    accent: 'co.in' | 'us',
    role: string,
}

type ChatHistory = Array<{ msg: string, fromPersonName: string }>

class Persons {
    static readonly persons: Array<Person> = [
        { color: '#0a7cff', name: 'me', role: 'Muhammad', accent: 'us' },
        { color: '#f0f0f0', name: 'ai', role: 'Ibrahim', accent: 'co.in' }
    ]

    static _lastPersonSpoke = 0

    static getByName(name: string) {
        return Persons.persons.find(p => p.name == name)
    }

    static getByColor(color: string) {
        return Persons.persons.find(p => p.color == color)
    }

    static getByAccent(accent: string) {
        return Persons.persons.find(p => p.accent == accent)
    }

    // returns the name of a person.
    static togglePerson(): Person {
        const idx = Number(!Persons._lastPersonSpoke)
        Persons._lastPersonSpoke = idx
        return Persons.persons[idx]
    }
}

class Chat {
    private static readonly maxHistoryLen = 5

    static history: ChatHistory = []

    static addToHistory(info: ChatHistory[0]) {
        if (Chat.history.length > Chat.maxHistoryLen)
            Chat.history.shift()

        Chat.history.push(info)
    }

    private static llamaStyleGeneration(personName: string) {
        let result = ''
        for (let h of Chat.history) {
            if (h.fromPersonName == personName) {
                result += `[INST] ${h.msg} [/INST]\n `
            }
            else result += h.msg + '\n'
        }
        return result
    }

    private static dialogueStyleGeneration(personName: string) {
        let otherIdx = Number(!Persons._lastPersonSpoke)
        let otherPerson = Persons.persons[otherIdx]
        let result = `Respond to the ${otherPerson.role} (in 1 sentence).\n\n` +
            `Here's the conversation up until now:\n`
        let conv = ''
        for (let h of Chat.history) {
            const { role } = $t(Persons.getByName(h.fromPersonName))
            conv += `${role}: "${h.msg}"\n`
        }
        result += conv
        return result
    }

    private static lastMessageGeneration() {
        return Chat.history.at(-1)!.msg
    }

    private static simplerGeneration(personName: string) {
        const person = $t(Persons.getByName(personName))
        let otherIdx = Number(!Persons._lastPersonSpoke)
        let otherPerson = Persons.persons[otherIdx]

        let result = `As "${person.role}", make 1 reply to the last message of the following conversation. You just need to curiously reply and ask thoughtful questions to the other person. Just reply, nothing else.\n\n`
        for (let h of Chat.history) {
            const { role } = $t(Persons.getByName(h.fromPersonName))
            result += `${role}: ${h.msg}\n`
        }
        return result
    }

    static generate(personName: string) {
        return Chat.llamaStyleGeneration(personName)
    }
}

class VoiceApi {
    private static baseUrl = ENV.AICAI_VOICEAPIURL || 'http://127.0.0.1:5000'

    static totalPlayed = 0

    private static buffer: Array<{ tts: 'gtts' | 'coqui-tts', accent: string, url: string, sentence: string }> = []

    static async play(sentence: string, fromPersonName: string, trial: boolean): Promise<void> {
        const person = $t(Persons.getByName(fromPersonName))
        const tts = trial ? 'gtts' : 'coqui-tts'

        const url = new URL('/sentence', VoiceApi.baseUrl)
        url.searchParams.append('accent', person.accent)
        url.searchParams.append('tts', tts)
        const u = url.toString()

        this.buffer.push({ accent: person.accent, sentence, tts, url: u })
        const len = this.buffer.length

        for (let i = 0; i < len; i++) {
            const item = this.buffer.shift()!
            try {
                await axios.post(item.url, item.sentence)
                VoiceApi.totalPlayed += 1
            }
            catch (e) {
                this.buffer.unshift(item)
                break
            }
        }
    }
}

type LlmApiGenerateOpts = { prompt: string, role: string }

class LlmApi {
    private static baseUrl = ENV.AICAI_LLMAPIURL || 'http://127.0.0.1:11434'

    private static llamaBaseUrl = 'https://www.llama2.ai'

    static totalGenerated = 0

    private static async ollamaApiAdapater(opts: LlmApiGenerateOpts) {
        const url = new URL('/api/generate', LlmApi.baseUrl)
        const u = url.toString()
        const response = await axios.post(u, {
            //model: 'orca-mini',
            model: ENV.AICAI_MODEL || 'llama2-uncensored',
            prompt: opts.prompt,
            stream: false,
            system: 'Reply in less than 20 words.'
            //system:'You are a curious person who likes to learn about new things and respond in less than 30 words.'
        })
        const result = response.data.response
        return result
    }

    private static async llamaApiAdapter(opts: LlmApiGenerateOpts) {
        const url = new URL('/api', LlmApi.llamaBaseUrl)
        const u = url.toString()
        const response = await axios.post(u, {
            audio: null, image: null,
            maxTokens: 800,
            prompt: opts.prompt,
            systemPrompt: 'You are an assistant who always replies in less than 20 words!',
            //systemPrompt: 'Reply in short, within 20 words, never longer than 20 words.',
            temperature: 0.75,
            topP: 0.9,
            version: '02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3'
        })
        const result = response.data
        return result
    }


    static async generate(opts: LlmApiGenerateOpts, trial = false): Promise<string> {
        let adapter: (opts: LlmApiGenerateOpts) => Promise<string> = LlmApi.ollamaApiAdapater

        if (trial) adapter = LlmApi.llamaApiAdapter

        const result = await adapter(opts)

        LlmApi.totalGenerated += 1
        return result
    }
}

class Utils {
    static getTimeNow() {
        return new Date()
    }

    static sleep(ms: number) {
        return new Promise(resl => setTimeout(resl, ms))
    }

    static throwOnUndefined<T>(value: undefined | T): never | T {
        if (value === undefined) throw Error('value is undefined')
        else return value
    }

    static splitByPunct(sentence: string) {
        const punctuationRegex = /[\.!?]/g;
        const wordsAndPunctuation = sentence.split(punctuationRegex);
        const filteredWordsAndPunctuation = wordsAndPunctuation.filter(element => element !== "");
        return filteredWordsAndPunctuation;
    }

    static includesPunct(sentence: string) {
        let puncts = ['!', '.', '?']
        const result = puncts.some(r => sentence.includes(r))
        return result
    }
}

const $t = Utils.throwOnUndefined

function startTextbubbleServer() {
    const app = express()
    app.use(express.json())
    app.post('/sentence', (req, res, next) => {
        const { data, accent } = req.body
        let result = ''

        const person = $t(Persons.getByAccent(accent))
        const timeNow = Utils.getTimeNow() // todo
        result = boxen(data, {
            //backgroundColor: person.color,
            width: 50,  // TODO set max width to half of screen
            padding: 1,

            float: person.name == 'me' ? 'right' : 'left',
            borderColor: person.color,
            borderStyle: 'round'
        })
        console.log(result)

        res.end()
        next()
    })
    app.listen(6000)
}

const loggerDebug = (...msg: any[]) => {
    if (process.env.AICAI_DEBUG) {
        console.log(...msg)
    }
}

type CmdOpts = { trial: boolean, icebreaker:string }

export default async function main(opts: CmdOpts) {
    startTextbubbleServer()

    const c = { msg: opts.icebreaker, fromPersonName: 'me' }
    Chat.addToHistory(c)
    VoiceApi.play(c.msg, c.fromPersonName, opts.trial)

    while (true) {
        if (LlmApi.totalGenerated - VoiceApi.totalPlayed > 5) {
            await Utils.sleep(1000)
            continue
        }

        loggerDebug('chat history is:', Chat.history)

        const { name, role } = Persons.togglePerson()
        loggerDebug('person about to reply:', role.split(' ').slice(0, 2).join(' '))

        const prompt = Chat.generate(name)
        loggerDebug('prompt about to be replied to:', prompt)

        const sentence = await LlmApi.generate({ prompt, role }, opts.trial)
        loggerDebug('resonse to prompt: ', sentence)

        VoiceApi.play(sentence, name, opts.trial)
        Chat.addToHistory({ msg: sentence, fromPersonName: name })
        loggerDebug('-------------------------------')
    }
}
