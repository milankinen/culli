import {O} from "@culli/base"

function Memory (initialState) {
  return function MemoryStorage(actions) {
    return O.scan((s, a) => a.apply(s), initialState, actions)
  }
}

Memory.__culli = true

export default Memory
