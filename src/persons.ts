const persons: Array<Person> = [
  {
    color: "#0a7cff",
    name: "me",
    role: "Muhammad",
    accent: "us",
    systemPrompt:
      "You ask thoughtful questions and you speak in less than 20 words. And you never ask off-topic questions, except around once after 20 messages.",
  },
  {
    color: "#f0f0f0",
    name: "ai",
    role: "Ibrahim",
    accent: "co.in",
    systemPrompt:
      "You are knowledgeable and you always answer questions in less than 20 words.",
  },
]
let _lastPersonSpoke = 0
function getByName(name: string) {
  return persons.find((p) => p.name == name)
}
function getByColor(color: string) {
  return persons.find((p) => p.color == color)
}
function getByAccent(accent: string) {
  return persons.find((p) => p.accent == accent)
}
function toggleAndGetPerson(): Person {
  const idx = Number(!_lastPersonSpoke)
  _lastPersonSpoke = idx
  return persons[idx]
}
const Persons = {
  get persons() {
    return persons
  },
  get _lastPersonSpoke() {
    return _lastPersonSpoke
  },
  set _lastPersonSpoke(val) {
    _lastPersonSpoke = val
  },
  getByName,
  getByColor,
  getByAccent,
  toggleAndGetPerson,
}
export { Persons }

export type Person = {
  color: string
  name: string
  accent: "co.in" | "us"
  role: string
  systemPrompt?: string
}
