import { div, input } from '@motorcycle/dom'

export default function main({ DOM, Store, min = 0, max = 100, step = 1 }) {
  const {dispatch, props} = model(Store)
  const vdom = view(props, {min, max, step})
  const actions = intent(DOM)

  return {
    DOM: vdom,
    Store: dispatch(actions)
  }

  function model({actions, value}) {
    const dispatch = actions.reduce((state, action) => {
      switch (action.type) {
        case 'SET':
          return {...state, val: action.payload}
        default:
          return state
      }
    })

    return {
      dispatch,
      props: {
        val: value.select('val')
      }
    }
  }

  function view({val}, {min, max, step}) {
    return val.value.map(val => {
      return div({}, [
        input('.slider', { attrs: {type: 'range', min, max, step, value: val} }), ' ', `${val}`
      ])
    })
  }

  function intent(domSource) {
    return domSource
      .select('.slider').events('input')
      .map(e => ({type: 'SET', payload: e.target.value}))
  }
}
