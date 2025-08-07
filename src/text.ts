import { Persons } from "./persons.js"
import { VoiceApi } from "./localVoiceApi.js"
import { Chat } from "./chat.js"
import { LlmApi } from "./localLlmApi.js"
import { startTextbubbleServer } from "./textBubbleServer.js"

type CmdOpts = { trial: boolean; icebreaker: string }

export default async function main(opts: CmdOpts) {
  opts.trial = false
  startTextbubbleServer()

  const c = { msg: opts.icebreaker, fromPersonName: "me" }
  Chat.addToHistory(c)
  VoiceApi.play(c.msg, c.fromPersonName, opts.trial)
  // todo remove
  //axios.post('http://localhost:6000/sentence', {data:sentence, accent:Persons.getByName(name)!.accent})

  while (true) {
    // todo remove.
    /*if (LlmApi.totalGenerated - VoiceApi.totalPlayed > 5) {
            await Utils.sleep(1000)
            continue
        } */

    const { name, role, systemPrompt } = Persons.toggleAndGetPerson()

    const prompt = Chat.generatePrompt(name)

    ///console.log(prompt)
    const sentence = await LlmApi.generateResponse(
      { prompt, role, systemPrompt },
      opts.trial,
    )

    //VoiceApi.play(sentence, name, opts.trial)
    // todo remove
    //axios.post('http://localhost:6000/sentence', {data:sentence, accent:Persons.getByName(name)!.accent})

    Chat.addToHistory({ msg: sentence, fromPersonName: name })
  }
}
