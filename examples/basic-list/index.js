import * as O from "most"
import Counter from "../counter"


export default function main(sources) {
  const {DOM: {h, lift: dom}, Store} = sources
  const {dispatch, props} = model(Store)
  const {vdom, children} = view(props)
  const actions = intent(vdom)

  return {
    DOM: dom(vdom),
    Store: O.merge(dispatch(actions), children.Store)
  }


  function model({value, actions}) {
    const dispatch = actions.reduce((state, action) => {
      switch (action.type) {
        case "ADD":
          return [...state, {id: newId(), value: 0}]
        default:
          return state
      }
    })
    return {
      dispatch,
      props: {
        counters: value
      }
    }
  }

  function view({counters}) {
    const children = counters.mapChildren(counter => Counter({
      ...sources,
      Store: counter.value.select("value")
    }))

    const vdom = h("div", [
      h("h1", "Counter list"),
      h("div", children.DOM),
      h("hr"),
      h("button.add", "Add new counter")
    ])

    return {vdom, children}
  }

  function intent(vdom) {
    const addClicks =
      vdom.on(".add", "click")

    return addClicks.map(() => ({type: "ADD"}))
  }
}

export function newId() {
  window._id_ = window._id_ || 0
  return ++_id_
}
