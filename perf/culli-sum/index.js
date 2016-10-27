import {run} from "@cycle/most-run"
import DOM from "@culli/dom"
import Store, {Memory} from "@culli/store"
import List, {nextId} from "./List"

const N = 10000
const sliders =
  Array.apply(0, Array(N)).map(() => ({id: nextId(), val: Math.floor(10 + Math.random() * 80) }))

run(List, {
  DOM: DOM("#app"),
  Store: Store(Memory({items: sliders}))
})
