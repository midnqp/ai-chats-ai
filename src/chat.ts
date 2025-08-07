import axios from "axios"
import { Persons } from "./persons.js"
import { $t } from "./util.js"
export type ChatHistory = Array<{ msg: string; fromPersonName: string }>
const maxHistoryLen = 5
let history: ChatHistory = []
function addToHistory(info: ChatHistory[0]) {
  if (history.length > maxHistoryLen) history.shift()
  history.push(info)
  axios.post("http://localhost:6000/sentence", {
    data: info.msg,
    accent: Persons.getByName(info.fromPersonName)!.accent,
  })
}
function llamaStyleGeneration(personName: string) {
  let result = ""
  for (let h of history) {
    if (h.fromPersonName == personName) {
      result += `[INST] ${h.msg} [/INST]\n `
    } else result += h.msg + "\n"
  }
  return result
}
function dialogueStyleGeneration(personName: string) {
  let otherIdx = Number(!Persons._lastPersonSpoke)
  let otherPerson = Persons.persons[otherIdx]
  let result =
    `Respond to the ${otherPerson.role} (in 1 sentence).\n\n` +
    `Here's the conversation up until now:\n`
  let conv = ""
  for (let h of history) {
    const { role } = $t(Persons.getByName(h.fromPersonName))
    conv += `${role}: "${h.msg}"\n`
  }
  result += conv
  return result
}
function lastMessageGeneration() {
  return history.at(-1)!.msg
}
function simplerGeneration(personName: string) {
  const person = $t(Persons.getByName(personName))
  let otherIdx = Number(!Persons._lastPersonSpoke)
  let otherPerson = Persons.persons[otherIdx]
  let result = `As "${person.role}", make 1 reply to the last message of the following conversation. You just need to curiously reply and ask thoughtful questions to the other person. Just reply, nothing else.\n\n`
  for (let h of history) {
    const { role } = $t(Persons.getByName(h.fromPersonName))
    result += `${role}: ${h.msg}\n`
  }
  return result
}
function generate(personName: string) {
  return llamaStyleGeneration(personName)
}
const Chat = {
  addToHistory,
  llamaStyleGeneration,
  dialogueStyleGeneration,
  lastMessageGeneration,
  simplerGeneration,
  generatePrompt: generate,
  get history() {
    return history
  },
  get maxHistoryLen() {
    return maxHistoryLen
  },
}
export { Chat }
