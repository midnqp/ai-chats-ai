import { Persons } from "./persons.js"
import { VoiceApi } from "./localVoiceApi.js"
import { Chat } from "./chat.js"
import { LlmApi } from "./localLlmApi.js"
import { startTextbubbleServer } from "./textBubbleServer.js"
import { Utils } from "./util.js"

export default async function main(opts: CmdOpts) {
  startTextbubbleServer()

  const c = { msg: opts.icebreaker, fromPersonName: "me" }
  Chat.addToHistory(c)
  VoiceApi.play(c.msg, c.fromPersonName)

  while (true) {
    if (LlmApi.totalGenerated - VoiceApi.totalPlayed > 5) {
      await Utils.sleep(1000)
      continue
    }
    const { name, role, systemPrompt } = Persons.toggleAndGetPerson()
    const prompt = Chat.generatePrompt(name)
    const sentence = await LlmApi.generateResponse(
      { prompt, role, systemPrompt },
      false,
    )
    VoiceApi.play(sentence, name)
    Chat.addToHistory({ msg: sentence, fromPersonName: name })
  }
}

type CmdOpts = { icebreaker: string }
