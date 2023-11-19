import axios from 'axios'
import chalk from 'chalk'
import express from 'express'
import boxen from 'boxen'
import {env as ENV} from 'node:process'

type Person = {
    color: string,
    name: string,
    accent: 'co.in' | 'us',
    role: string,
}

type ChatHistory = Array<{ msg: string, fromPersonName: string }>

class Persons {
    static readonly persons: Array<Person> = [
        { color: 'cyan', name: 'me', role: 'Muhammad', accent: 'us' },
        { color: 'grey', name: 'ai', role: 'Ibrahim', accent: 'co.in' }
    ]

    static _lastPersonSpoke = 0

    static getByName(name: string) {
        return this.persons.find(p => p.name == name)
    }

    static getByColor(color: string) {
        return this.persons.find(p => p.color == color)
    }

    static getByAccent(accent: string) {
        return this.persons.find(p => p.accent == accent)
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
        if (this.history.length > this.maxHistoryLen)
            this.history.shift()

        this.history.push(info)
    }

    private static llamaStyleGeneration(personName: string) {
        let result = ''
        for (let h of this.history) {
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
        for (let h of this.history) {
            const { role } = $t(Persons.getByName(h.fromPersonName))
            conv += `${role}: "${h.msg}"\n`
        }
        result += conv
        return result
    }

    private static lastMessageGeneration() {
        return this.history.at(-1)!.msg
    }

    private static simplerGeneration(personName:string) {
        const person = $t(Persons.getByName(personName))
        let otherIdx = Number(!Persons._lastPersonSpoke)
        let otherPerson = Persons.persons[otherIdx]

        let result = `As "${person.role}", make 1 reply to the last message of the following conversation. You just need to curiously reply and ask thoughtful questions to the other person. Just reply, nothing else.\n\n`
        for (let h of this.history) {
            const { role } = $t(Persons.getByName(h.fromPersonName))
            result += `${role}: ${h.msg}\n`
        }
        return result
    }

    static generatePromptAsPerson(personName: string) {
        return this.lastMessageGeneration()
    }
}

class VoiceApi {
    private static baseUrl = ENV.AICAI_VOICEAPIURL || 'http://127.0.0.1:5000'

    static totalPlayed = 0

    static playSentence(sentence: string, fromPersonName: string) {
        const person = $t(Persons.getByName(fromPersonName))

        const url = new URL('/sentence', this.baseUrl)
        url.searchParams.append('accent', person.accent)
        const u = url.toString()

        this.totalPlayed += 1
        return axios.post(u, sentence).catch(_=>_)
    }
}

class LlmApi {
    private static baseUrl = ENV.AICAI_LLMAPIURL ||  'http://127.0.0.1:11434'

    static totalGenerated = 0

    static async generate(opts: { prompt: string, role: string }) {
        const url = new URL('/api/generate', this.baseUrl)
        const u = url.toString()
        const response = await axios.post(u, {
            //model: 'orca-mini',
            //model: 'llama2-uncensored',
            model: ENV.AICAI_MODEL || 'llama2-uncensored-10t',
            prompt: opts.prompt,
            stream: false,
            system: 'Reply in less than 20 words.'
            //system:'You are a curious person who likes to learn about new things and respond in less than 30 words.'
        })

        this.totalGenerated += 1
        return response.data.response
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

    static splitByPunct(sentence:string) {
        const punctuationRegex = /[\.!?,]/g;
        const wordsAndPunctuation = sentence.split(punctuationRegex);
        const filteredWordsAndPunctuation = wordsAndPunctuation.filter(element => element !== "");
        return filteredWordsAndPunctuation;
    }

    static includesPunct(sentence:string) {
        let puncts = ['!', ',', '.', '?']
        const result = puncts.some(r => sentence.includes(r))
        return result
    }
}

const $t = Utils.throwOnUndefined
const app = express()
app.use(express.json())
app.post('/sentence', (req, res, next) => {
    const { data, accent } = req.body
    let result = ''

    const person = $t(Persons.getByAccent(accent))
    const timeNow = Utils.getTimeNow() // todo
    result = boxen(data, {
        backgroundColor: person.color,
        width: 50,  // TODO set max width to half of screen
        padding: 1,

        float: person.name == 'me' ? 'right' : 'left',
        borderStyle: 'none'
    })
    console.log(result)

    res.end()
    next()
})
app.listen(6000)

const c = { msg: 'Lets talk about Bangladesh!', fromPersonName: 'me' }
Chat.addToHistory(c)
VoiceApi.playSentence(c.msg, c.fromPersonName)

while (true) {
    if (LlmApi.totalGenerated - VoiceApi.totalPlayed > 10) {
        await Utils.sleep(1000)
        continue
    }
    //console.log('chat history is', Chat.history)
    const { name, role } = Persons.togglePerson()
    //console.log('about to generate some text/prompt that will be replied to by person:',role.split(' ').slice(0, 2).join(' '))
    const prompt = Chat.generatePromptAsPerson(name)
    //console.log(chalk.bgYellow(prompt))
    const sentence = await LlmApi.generate({ prompt, role })
    //console.log('his resonse is:', chalk.bgMagenta(sentence))
    VoiceApi.playSentence(sentence, name)
    Chat.addToHistory({ msg: sentence, fromPersonName: name })
    //console.log('-------------------------------')
}