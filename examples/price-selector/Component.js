import * as O from "most"
import Slider from "../slider/Component"


export default function main(sources) {
  const {DOM: {h, combine}, Store} = sources
  const {dispatch, props} = model(Store)
  const {vdom, children} = view(props)
  const actions = intent(vdom, props)

  return {
    DOM: combine(vdom),
    Store: O.merge(dispatch(actions), children.Store)
  }


  function model({actions, value}) {
    const dispatch = actions.reduce((state, action) => {
      switch (action.type) {
        case "FIT_PRICE":
          const {from: {val: from}, to: {val: to}, price: {val: price}} = state
          return {...state, price: {val: Math.min(to, Math.max(from, price))}}
        default:
          return state
      }
    })

    return {
      dispatch,
      props: {
        from: value.select("from"),
        to: value.select("to"),
        price: value.select("price")
      }
    }
  }

  function view(props) {
    const valOf = prop =>
      prop.value.map(m => m.val)

    const from = Slider({
      ...sources,
      Store: props.from,
      min: 0,
      // ensure that "from" can't be bigger than "to"
      max: valOf(props.to)
    })
    const to = Slider({
      ...sources,
      Store: props.to,
      // ensure that "to" can't be smaller than "from"
      min: valOf(props.from),
      max: 1000
    })
    const price = Slider({
      ...sources,
      Store: props.price,
      // ensure that "price" can be only between [from...to]
      min: valOf(props.from),
      max: valOf(props.to)
    })

    const vdom = h("div", [
      h("h1", ["Select price (", valOf(props.price), ")"]),
      price.DOM,
      h("hr"),
      h("h4", "From:"), from.DOM,
      h("h4", "To:"), to.DOM
    ])

    return {
      vdom,
      children: {
        Store: O.mergeArray([from.Store, to.Store, price.Store])
      }
    }
  }

  function intent(vdom, props) {
    // make sure that if "from" or "to" changes, price is also fitted between them
    // we don't want to trigger fitting from initial values, hence skip(1)
    const rangeChanges = O.merge(
      props.from.value.skip(1),
      props.to.value.skip(1)
    )
    return rangeChanges.map(() => ({type: "FIT_PRICE"}))
  }
}
