import Memory from "./memory"

function HotReloadable (initialState, reloadKey = "__culli_HMR_State") {
  if (reloadKey in window) {
    initialState = window[reloadKey]
  }

  function HotReloadableMemoryStorage(actions) {
    return Memory(initialState)(actions)
  }

  HotReloadableMemoryStorage.__culli = true
  return HotReloadableMemoryStorage
}


export default HotReloadable
