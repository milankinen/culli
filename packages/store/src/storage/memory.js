import {O} from "@culli/base"

function Memory (initialState) {
  function MemoryStorage(actions) {
    return O.scan((s, a) => a.apply(s), initialState, actions)
  }
  MemoryStorage.__culli = true
  return MemoryStorage
}


export default Memory
