import * as O from "most"

export default function main({DOM: {h, combine}}) {
  const date = O.periodic(1000).map(() => new Date().toTimeString())

  const vdom = h("div", [
    h("h2", ["Clock is: ", date])
  ])

  return {
    DOM: combine(vdom)
  }
}
