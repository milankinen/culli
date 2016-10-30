import {O, extend} from "@culli/base"
import Memory from "./memory"


function ReduxDevtools(initial) {
  const devtools = window.__REDUX_DEVTOOLS_EXTENSION__
  if (!devtools) {
    return Memory(initial)
  }

  function ReduxDevtoolsStorage(actions) {
    return O.create(({next}) => {
      const store = devtools((s, a) => a.type === "@@INIT" ? initial : a.__.apply(s))
      const disposeStore = store.subscribe(() => next(store.getState()))
      const disposeActions = O.subscribe({
        next: a => store.dispatch(extend({}, a.value, {__: a}))
      }, actions)
      next(initial)
      return () => {
        disposeActions()
        disposeStore()
      }
    })
  }

  ReduxDevtoolsStorage.__culli = true
  return ReduxDevtoolsStorage
}

export default ReduxDevtools
