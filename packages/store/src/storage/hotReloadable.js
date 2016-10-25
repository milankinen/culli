import Memory from "./memory"

function HotReloadable (initialState, reloadKey = "__culli_HMR_State") {
  if (reloadKey in window) {
    initialState = window[reloadKey]
  }

  return function HotReloadableMemoryStorage(actions) {
    return Memory(initialState)(actions)
  }
}

HotReloadable.__culli = true

export default HotReloadable
