import xs from "xstream"
import {h} from "@cycle/dom"

export default function main({DOM, onion, min = 0, max = 100, step = 1}) {
  const vdom = view(onion.state$)
  const actions = intent(DOM)
  const reducers = model(actions)

  return {
    DOM: vdom,
    onion: reducers
  }


  function view(state) {
    return state.map(({num}) =>
      h("div", [
        h("input.slider", {props: {type: "range", min, max, step, value: num}}), ` ${num}`
      ]))
  }

  function intent(DOM) {
    return DOM.select(".slider")
      .events("input")
      .map(e => ({type: "SET", payload: e.target.value}))
  }

  function model(actions) {
    return actions
      .filter(a => a.type === "SET")
      .map(a => state => ({...state, num: a.payload}))
  }
}
