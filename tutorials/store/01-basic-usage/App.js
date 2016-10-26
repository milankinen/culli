import * as O from "most"
import {h} from "@cycle/dom"


export default function main({DOM, Store}) {
  const {dispatch, props} = model(Store)
  const vdom = view(props)
  const actions = intent(DOM)

  return {
    DOM: vdom,
    Store: dispatch(actions)
  }


  function model({actions, value}) {
    const dispatch = actions.reduce((state, action) => {
      switch (action.type) {
        case "INC":
          return {...state, num: state.num + 1}
        case "DEC":
          return {...state, num: state.num - 1}
        default:
          return state
      }
    })

    return {
      dispatch,
      props: {
        num: value.map(v => v.num)
      }
    }
  }

  function view({num}) {
    return num.map(num =>
      h("div", [
        h("h1", [`Counter: ${num}`]),
        h("div", [
          h("button.inc", "Increment"),
          h("button.dec", "Decrement")
        ])
      ]))
  }

  function intent(DOM) {
    const incrementActions = DOM.select(".inc")
      .events("click")
      .map(() => ({type: "INC"}))
    const decrementActions = DOM.select(".dec")
      .events("click")
      .map(() => ({type: "DEC"}))

    return O.merge(incrementActions, decrementActions)
  }
}
