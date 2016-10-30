import * as O from "most"

export default function main({DOM: {h, combine}, Store, min = 0, max = 100, step = 1}) {
  const {dispatch, props} = model(Store)
  const vdom = view(props, {min, max, step})
  const actions = intent(vdom)

  return {
    DOM: combine(vdom),
    Store: dispatch(actions)
  }


  function model({actions, value}) {
    const dispatch = actions.reduce((state, action) => {
      switch (action.type) {
        case "SET":
          return {...state, val: action.payload}
        default:
          return state
      }
    })

    return {
      dispatch,
      props: {
        val: value.select("val")
      }
    }
  }

  function view({val}, {min, max, step}) {
    return h("div", [
      h("input.slider", {type: "range", min, max, step, value: val.value}), " ", val.value
    ])
  }

  function intent(vdom) {
    return vdom
      .on(".slider", "input")
      .map(e => ({type: "SET", payload: Number(e.target.value)}))
  }
}
