import {run} from "@cycle/most-run"
import DOM from "@culli/dom"
import Store, {Memory} from "@culli/store"
import PriceSelector from "./Component"


run(PriceSelector, {
  DOM: DOM("#app"),
  Store: Store(Memory({from: {val: 0}, to: {val: 1000}, price: {val: 0}}))
})
