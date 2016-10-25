import * as O from "most"


export default function main({DOM: {h, lift: dom}, Store}) {
  const {dispatch, props} = model(Store)
  const vdom = view(props)
  const actions = intent(vdom)

  return {
    DOM: dom(vdom),
    Store: dispatch(actions)
  }


  function model({actions, value}) {
    const dispatch = actions.reduce((state, action) => {
      switch (action.type) {
        case "INC":
          return state + 1
        case "DEC":
          return state - 1
        default:
          return state
      }
    })

    return {
      dispatch,
      props: {
        value
      }
    }
  }

  function view({value}) {
    return h("div", [
      h("h1", ["Counter: ", value]),
      h("div", [
        h("button.inc", "Increment"),
        h("button.dec", "Decrement")
      ])
    ])
  }

  function intent(vdom) {
    const incClicks = vdom.on(".inc", "click")
    const decClicks = vdom.on(".dec", "click")

    return O.mergeArray([
      incClicks.map(() => ({type: "INC"})),
      decClicks.map(() => ({type: "DEC"}))
    ])
  }

}
