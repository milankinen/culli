import * as O from "most"
import isolate from "@cycle/isolate"
import {h} from "@cycle/dom"
import Counter from "../01-basic-usage/App"


export default function main({DOM, Store}) {
  const {dispatch, props} = model(Store)
  const {vdom, childActions} = view(props)
  const actions = intent(DOM)

  return {
    DOM: vdom,
    Store: O.merge(dispatch(actions), childActions)
  }


  function model({actions, value}) {
    const dispatch = actions.reduce((state, action) => {
      switch (action.type) {
        case "SET_TEXT":
          return {...state, text: action.payload}
        default:
          return state
      }
    })

    return {
      dispatch,
      props: {
        a: value.select("a"),
        b: value.select("b"),
        text: value.select("text")
      }
    }
  }

  function view({a, b, text}) {
    const counterA = isolate(Counter)({DOM, Store: a})
    const counterB = isolate(Counter)({DOM, Store: b})

    return {
      childActions: O.merge(counterA.Store, counterB.Store),
      vdom: O.combineArray((aDOM, bDOM, txt) =>
        h("div", [
          h("h1", ["Hello: ", txt]),
          aDOM,
          bDOM,
          h("hr"),
          h("input.text", {props: {value: txt}})
        ]), [counterA.DOM, counterB.DOM, text.value])
    }
  }

  function intent(DOM) {
    return DOM.select(".text")
      .events("input")
      .map(e => ({
        type: "SET_TEXT",
        payload: e.target.value
      }))
  }
}
