import xs from "xstream"
import {run} from "@cycle/xstream-run"
import DOM from "@culli/dom"
import onionify from "cycle-onionify"

run(onionify(main), {
  DOM: DOM("#app")
})


function main({DOM: {combine, h}, onion}) {
  // model
  const value$ = onion.state$.map(s => s.value)
  const step$ = onion.state$.map(s => s.step)
  // view
  const vdom = h("div", [
    h("h1", "Cycle onionify counter with @culli/dom"),
    h("p", ["Counter value is now: ", value$]),
    h("button.plus", "++"),
    h("button.minus", "--"),
    h("div", [
      "Step: ",
      h("input.step", {type: "range", min: 1, max: 10, value: step$}),
      "(", step$, ")"
    ])
  ])
  // intent
  const plusClick$ = vdom.on(".plus", "click")
  const minusClick$ = vdom.on(".minus", "click")
  const setStep$ = vdom.on(".step", "input").map(e => Number(e.target.value))
  const reducer$ = xs.merge(
    xs.of(() => ({value: 0, step: 1})),   // initial value
    plusClick$.mapTo(({value, step}) => ({step, value: value + step})),
    minusClick$.mapTo(({value, step}) => ({step, value: value - step})),
    setStep$.map(newStep => state => ({...state, step: newStep}))
  )

  return {
    DOM: combine(vdom),
    onion: reducer$
  }
}
