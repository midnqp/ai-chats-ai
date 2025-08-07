import boxen from "boxen"
import express from "express"
import { Persons } from "./persons.js"
import { $t, Utils } from "./util.js"
import moment from "moment"

export function startTextbubbleServer() {
  const app = express()
  app.use(express.json())
  app.post("/sentence", (req, res, next) => {
    const { data, accent } = req.body
    let result = ""
    const person = $t(Persons.getByAccent(accent))
    const float = person.name == "me" ? "right" : "left"
    result = boxen(data, {
      width: 50,
      padding: 1,
      float,
      borderColor: person.color,
      borderStyle: "round",
    })
    const now = moment(new Date()).format("h:mma D MMM")
    const r = boxen(now, { borderStyle: "none", padding: 0, float })
    console.log(result)
    console.log(r)
    res.end()
    next()
  })
  app.listen(6000)
}
