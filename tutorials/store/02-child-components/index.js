import {run} from "@cycle/most-run"
import {makeDOMDriver as DOM} from "@cycle/dom"
import Store, {Memory} from "@culli/store"
import App from "./App"


run(App, {
  DOM: DOM("#app"),
  Store: Store(Memory({text: "", a: {num: 0}, b: {num: 0}}))
})

