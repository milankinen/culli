import * as O from "most"
import isolate from "@cycle/isolate"
import {h} from "@cycle/dom"
import Counter from "../01-basic-usage/App"


let id = 0
export const newId = () => ++id

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
        case "ADD":
          return {...state, items: [...state.items, {id: newId(), num: 0}]}
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
    const children = items.value.mapChildren((counter, id) => {
      console.log(counter, id)
      const Component = isolate(Counter, id)
      return Component({DOM, Store: counter})
    })

    return {
      childActions: children.Store,
      vdom: children.DOM.map(childDOMs => h("div", [
        h("h1", "Counter list"),
        h("div", childDOMs),
        h("hr"),
        h("button.add", "Add new counter")
      ]))
    }
  }

  function intent(DOM) {
    return DOM.select(".add")
      .events("click")
      .map(e => ({type: "ADD"}))
  }
}
