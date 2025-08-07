import axios from "axios"
import { Persons } from "./persons.js"
import { $t } from "./util.js"
const ENV = process.env
const baseUrl = ENV.AICAI_VOICEAPIURL || "http://127.0.0.1:5000"
let totalPlayed = 0
let buffer: Array<{
  tts: "gtts" | "coqui-tts"
  accent: string
  url: string
  sentence: string
}> = []
async function play(
  sentence: string,
  fromPersonName: string,
  trial: boolean,
): Promise<void> {
  const person = $t(Persons.getByName(fromPersonName))
  const tts = trial ? "gtts" : "coqui-tts"
  const url = new URL("/sentence", baseUrl)
  url.searchParams.append("accent", person.accent)
  url.searchParams.append("tts", tts)
  const u = url.toString()
  buffer.push({ accent: person.accent, sentence, tts, url: u })
  const len = buffer.length
  for (let i = 0; i < len; i++) {
    const item = buffer.shift()!
    try {
      await axios.post(item.url, item.sentence)
      totalPlayed += 1
    } catch (e) {
      buffer.unshift(item)
      break
    }
  }
}
const VoiceApi = {
  play,
  get totalPlayed() {
    return totalPlayed
  },
}
export { VoiceApi }
