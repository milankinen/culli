import {run} from "@cycle/most-run"
import {makeDOMDriver as DOM} from "@cycle/dom"
import Store, {Memory} from "@culli/store"
import App, {newId} from "./App"


run(App, {
  DOM: DOM("#app"),
  Store: Store(Memory({items: [{id: newId(), num: 0}, {id: newId(), num: 0}]}))
})

