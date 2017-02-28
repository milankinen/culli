import * as O from 'most'
import Slider from './Slider'
import { h1, div, hr, button } from '@motorcycle/dom'
import { combineObj } from 'most-combineobj'
import isolate from '@cycle/isolate'

let ID = 0
export const nextId = () => ++ID

export default function main(sources) {
  const {Store} = sources
  const {dispatch, props} = model(Store)
  const {vdom, children} = view(props)
  const actions = intent(sources.DOM)

  return {
    DOM: vdom,
    Store: O.merge(dispatch(actions), children.Store)
  }

  function model({actions, value}) {
    const dispatch = actions.reduce((state, action) => {
      switch (action.type) {
        case 'ADD':
          return {items: [{id: nextId(), val: Math.floor(10 + Math.random() * 80)}, ...state.items]}
        default:
          return state
      }
    })

    return {
      dispatch,
      props: {
        items: value.select('items')
      }
    }
  }

  function view({items}) {
    const children = items.value.mapChildren((it, id) => isolate(Slider, id)({...sources, Store: it}),
      {values: ['DOM'], events: ['Store']})
    const state = combineObj({ childrenDOM: children.DOM, items: items.value })
    const vdom = state.map(({ childrenDOM, items }) => div({}, [
      h1('.header', `CULLI witch motorcycle DOM: ${items.length}`),
      button('.add', 'Add slider'),
      hr(),
      div('.sliders', childrenDOM)
    ]))

    return {vdom, children}
  }

  function intent(domSource) {
    return domSource
      .select('.add').events('click')
      .map(e => ({type: 'ADD'}))
  }
}
