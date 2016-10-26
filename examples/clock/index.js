import {run} from "@cycle/most-run"
import DOM from "@culli/dom"
import Clock from "./Component"

run(Clock, {
  DOM: DOM("#app")
})
