import {O} from "@culli/base"
import {throws} from "./util"


export default (SA, {newId, Nodes: {Combined}}) => {
  const convertOut = O.adaptOut(SA)
  const convertIn = O.adaptIn(SA.streamSubscribe)
  const isObs = x => x && SA.isValidStream(x)
  const hold = SA.remember

  return function combine(vdom) {
    if (isVNode(vdom)) {
      const vnode = combined(vdom)
      const obs = convertOut(O.of(vnode))
      obs.__vnode = vnode
      return obs
    } else if (isObs(vdom)) {
      const obs = convertOut(O.map(combineInner, convertIn(vdom)))
      return hold(obs)
    } else {
      throws(`Can't combine vdom: ${vdom}`)
    }
  }

  function combined(vnode) {
    return new Combined(newId(), vnode)
  }

  function combineInner(vnode) {
    !isVNode(vnode) && throws(`Can't combine vnode: ${vnode}`)
    return combined(vnode)
  }

  function isVNode(x) {
    return x && x.__isNode
  }
}

