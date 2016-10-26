import xs from "xstream"


export default function main({DOM: {h, combine}, Store}) {
  const {dispatch, props} = model(Store)
  const vdom = view(props)
  const actions = intent(vdom)

  return {
    DOM: combine(vdom),
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
        num: value.select("num")
      }
    }
  }

  function view({num}) {
    return h("div", [
      h("h1", ["Counter: ", num.value]),
      h("div", [
        h("button.inc", "Increment"),
        h("button.dec", "Decrement")
      ])
    ])
  }

  function intent(vdom) {
    return xs.merge(
      vdom.on(".inc", "click")
        .map(() => ({type: "INC"})),
      vdom.on(".dec", "click")
        .map(() => ({type: "DEC"}))
    )
  }
}
