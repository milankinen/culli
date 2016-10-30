import * as O from "most"
import Slider from "../slider/Component"


let ID = 0
export const nextId = () => ++ID


export default function main(sources) {
  const {DOM: {h, combine}, Store} = sources
  const {dispatch, props} = model(Store)
  const {vdom, children} = view(props)
  const actions = intent(vdom)

  return {
    DOM: combine(vdom),
    Store: O.merge(dispatch(actions), children.Store)
  }


  function model({actions, value}) {
    const dispatch = actions.reduce((state, action) => {
      switch (action.type) {
        case "ADD":
          return {items: [{id: nextId(), val: Math.floor(10 + Math.random() * 80)}, ...state.items]}
        default:
          return state
      }
    })

    return {
      dispatch,
      props: {
        items: value.select("items")
      }
    }
  }

  function view({items}) {
    const children = items.value.mapChildren(it => Slider({...sources, Store: it}),
      {values: ["DOM"], events: ["Store"]})

    const sum = items.value.map(items => calcSum(items.map(it => it.val)))

    const vdom = h("div", [
      h("h1", ["Total: ", sum]),
      h("button.add", "Add slider"),
      h("hr"),
      h("div.sliders", children.DOM)
    ])

    return {vdom, children}
  }

  function intent(vdom) {
    return vdom
      .on(".add", "click")
      .map(e => ({type: "ADD"}))
  }
}

function calcSum(vals) {
  let s = 0
  for (let i = 0; i < vals.length; i++) {
    s += vals[i]
  }
  return s
}
