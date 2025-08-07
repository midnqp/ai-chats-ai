function getTimeNow() {
  return new Date()
}
function sleep(ms: number) {
  return new Promise((resl) => setTimeout(resl, ms))
}
function throwOnUndefined<T>(value: undefined | T): never | T {
  if (value === undefined) throw Error("value is undefined")
  else return value
}
function splitByPunct(sentence: string) {
  const punctuationRegex = /[\.!?]/g
  const wordsAndPunctuation = sentence.split(punctuationRegex)
  const filteredWordsAndPunctuation = wordsAndPunctuation.filter(
    (element) => element !== "",
  )
  return filteredWordsAndPunctuation
}
function includesPunct(sentence: string) {
  let puncts = ["!", ".", "?"]
  const result = puncts.some((r) => sentence.includes(r))
  return result
}
const Utils = {
  getTimeNow,
  sleep,
  throwOnUndefined,
  splitByPunct,
  includesPunct,
}
export const $t = throwOnUndefined
export const loggerDebug = (...msg: any[]) => {
  if (process.env.AICAI_DEBUG) {
    console.log(...msg)
  }
}
export { Utils }
