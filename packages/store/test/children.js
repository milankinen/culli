import {__, O, curry, isObj, keys} from "@culli/base"
import R from "ramda"
import Store, {Memory} from "../src/index"


describe("mapChildren", () => {
  const Child = (item, id) => ({
    DOM: O.merge([O.of(id + "-1d"), O.of(id + "-2d").delay(10)]),
    Eff: O.merge([O.of(id + "-1e"), O.of(id + "-2e").delay(10)])
  })

  it("creates sinks for each key", () => {
    const store = Store(Memory([{id: "1"}, {id: "2"}]))(O.never(), O.Adapter)
    const children = store.value.mapChildren(Child, {events: ["Foo", "Bar"], values: ["Lol"]})
    isObj(children).should.be.true()
    keys(children).length.should.eql(3)
    O.is(children.Foo).should.be.true()
    O.is(children.Bar).should.be.true()
    O.is(children.Lol).should.be.true()
  })

  it("combines value sinks of children over time", done => {
    const values = run([{id: "a"}, {id: "b"}], ({value}) => {
      const children = value.mapChildren(Child, {events: ["Eff"], values: ["DOM"]})
      const expected = [["a-1d", "b-1d"], ["a-2d", "b-1d"], ["a-2d", "b-2d"]]
      __(children.DOM.take(3), subscribeAndExpect(expected, done))
      return [value, O.empty()]
    })
    O.subscribe({}, values)
  })

  it("merges event sinks from children", done => {
    const values = run([{id: "a"}, {id: "b"}], ({value}) => {
      const children = value.mapChildren(Child, {events: ["Eff"], values: ["DOM"]})
      const expected = ["a-1e", "b-1e", "a-2e", "b-2e"]
      __(children.Eff.take(4), subscribeAndExpect(expected, done))
      return [value, O.empty()]
    })
    O.subscribe({}, values)
  })

  it("preserves the underlying subscriptions even if children change", done => {
    const values = run([{id: "a"}, {id: "b"}], ({value, actions}) => {
      const dispatch = actions.reduce((state, action) => action(state))
      const children = value.mapChildren(Child, {events: ["Eff"], values: ["DOM"]})
      const expected = [
        ["a-1d", "b-1d"],
        ["a-1d", "b-1d", "c-1d"],
        ["a-2d", "b-1d", "c-1d"],
        ["a-2d", "b-2d", "c-1d"],
        ["a-2d", "b-2d", "c-2d"]
      ]
      __(children.DOM.take(5), subscribeAndExpect(expected, done))
      return [value, dispatch(O.of(R.append({id: "c"})).delay(3))]
    })
    O.subscribe({}, values)
  })
})


const run = (initial, fn, opts) => {
  const st = Store(Memory(initial), opts)
  const {observer, stream} = O.Adapter.makeSubject()
  const [value, actions] = fn(st(stream, O.Adapter))
  O.subscribe(observer, actions)
  return value
}

const subscribeAndExpect = curry((expected, done, stream) => {
  expected = [...expected]
  return __(stream.take(expected.length), O.subscribe({
    next: x => x.should.deepEqual(expected.shift()),
    complete: () => {
      expected.length.should.equal(0)
      done()
    },
    error: done
  }))
})
