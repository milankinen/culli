import {run} from "@cycle/xstream-run"
import {makeDOMDriver} from "@cycle/dom"
import onionify from "cycle-onionify"
import List from "./List"

run(onionify(List), {
  DOM: makeDOMDriver("#app")
})
