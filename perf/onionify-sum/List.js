import xs from "xstream"
import {h} from "@cycle/dom"
import isolate from "@cycle/isolate"
import {pick, mix} from "cycle-onionify"
import Slider from "./Slider"

const N = 2000

export default function main(sources) {
  const {vdom, children} = view(sources.onion.state$.filter(s => s !== undefined))
  const actions = intent(sources.DOM)
  const reducers = model(actions)

  return {
    DOM: vdom,
    onion: xs.merge(reducers, children.onion)
  }


  function view(state) {
    const children = state.map(items =>
      items.map((item, i) => isolate(Slider, i)(sources)))

    return {
      children: {
        onion: children.compose(pick(sinks => sinks.onion)).compose(mix(xs.merge))
      },
      vdom: xs.combine(state.map(s => s.length), children.compose(pick(sinks => sinks.DOM)).compose(mix(xs.combine)))
        .map(([len, childDOMs]) =>
          h("div", [
            h("h1", `cycle-onionify sliders ${len}`),
            h("button.add", "Add slider"),
            h("hr"),
            h("div.sliders", childDOMs)
          ]))
    }
  }

  function model(actions) {
    const add = actions
      .filter(a => a.type === "ADD")
      .map(() => items => [slider(), ...items])
    const init = xs.of(() =>
      Array.apply(0, Array(N)).map(slider))

    return xs.merge(init, add)
  }

  function intent(DOM) {
    return DOM.select(".add")
      .events("click")
      .map(e => ({type: "ADD"}))
  }
}

const slider = () =>
  ({num: 10 + Math.floor(Math.random() * 80)})
