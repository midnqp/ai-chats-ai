import axios from "axios"
export type LlmApiGenerateOpts = {
  prompt: string
  role: string
  systemPrompt?: string
}

const ENV = process.env
const localOllamaBaseUrl = ENV.AICAI_LLMAPIURL || "http://127.0.0.1:11434"
let totalGenerated = 0

async function ollamaApiAdapater(opts: LlmApiGenerateOpts) {
  const url = new URL("/api/generate", localOllamaBaseUrl)
  const u = url.toString()
  const response = await axios.post(u, {
    model:
      ENV.AICAI_MODEL ||
      "llama3.2:3b" ||
      "orca-mini" ||
      "tinyllama" ||
      "llama2-uncensored",
    prompt: opts.prompt,
    stream: false,
    system:
      opts.systemPrompt ||
      "You are hold interesting conversations and you always reply in less than 20 words.",
  })
  const result = response.data.response
  return result.replace(/\[[^\]]+\]/g, "").replace(/\[\/[^"]+\]/g, "")
}

async function generateResponseFromConversationHistory(
  opts: LlmApiGenerateOpts,
  trial = false,
): Promise<string> {
  let adapter: (opts: LlmApiGenerateOpts) => Promise<string> = ollamaApiAdapater
  const result = await adapter(opts)
  totalGenerated += 1
  return result
}

const LlmApi = {
  ollamaApiAdapater,
  generateResponse: generateResponseFromConversationHistory,
  get totalGenerated() {
    return totalGenerated
  },
}

export { LlmApi }
