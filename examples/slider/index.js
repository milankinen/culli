import {run} from "@cycle/most-run"
import DOM from "@culli/dom"
import Store, {Memory} from "@culli/store"
import Slider from "./Component"

run(Slider, {
  DOM: DOM("#app"),
  Store: Store(Memory({val: 10}))
})
