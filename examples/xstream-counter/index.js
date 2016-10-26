import {run} from "@cycle/xstream-run"
import DOM from "@culli/dom"
import Store, {Memory} from "@culli/store"
import Counter from "./Component"

run(Counter, {
  DOM: DOM("#app"),
  Store: Store(Memory({num: 0}))
})
