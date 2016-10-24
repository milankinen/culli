import R from "ramda"
import {__, O, curry} from "@culli/base"
import Store from "../src/index"


describe("Store", () => {
  it("emits its initial value", done => {
    const values = run("tsers", store => [store.value, O.empty()])
    __(values, subscribeAndExpect(["tsers"], done))
  })

  it("provides way to update store state by defining reducer function", done => {
    const values = run("tsers", ({value, actions}) => {
      const dispatch = actions.reduce((state, action) => state + action)
      return [value, dispatch(O.from(["!", "?"]))]
    })
    const expected = ["tsers", "tsers!", "tsers!?"]
    __(values, subscribeAndExpect(expected, done))
  })

  it("skips duplicate states based on identity", done => {
    const values = run(1, ({value, actions}) => {
      const dispatch = actions.reduce((state, action) => state + action)
      return [value, dispatch(O.from([0, 0, 1, 1, 0, -2]))]
    })
    const expected = [1, 2, 3, 1]
    __(values, subscribeAndExpect(expected, done))
  })

  it("supports custom equality check for duplicate skipping", done => {
    const eq = (a, b) => a.toUpperCase() === b.toUpperCase()
    const values = run("tsers", ({value, actions}) => {
      const dispatch = actions.reduce((state, action) => action)
      return [value, dispatch(O.from(["Tsers", "TSERS", "tsers!", "Tsers!", "tsers?"]))]
    }, {eq})
    const expected = ["tsers", "tsers!", "tsers?"]
    __(values, subscribeAndExpect(expected, done))
  })

  describe("sub-state selection", () => {
    it("makes a sub-model that observes changes of the focused part", done => {
      const values = run({foo: "tsers", bar: 1}, ({value, actions}) => {
        const dispatch = actions.reduce((state, fn) => fn(state))
        const foo = value.select("foo")
        return [
          foo.value,
          dispatch(O.from([
            R.assoc("foo", "tsers!"),
            R.assoc("bar", 1),
            R.assoc("foo", "tsers!")
          ]))
        ]
      })
      // skip duplicates apply to selected sub-model as well!
      const expected = ["tsers", "tsers!"]
      __(values, subscribeAndExpect(expected, done))
    })

    it("propagates sub-model changes to the parent model", done => {
      const values = run({foo: "tsers", bar: 1}, ({value}) => {
        const child = value.select("foo")
        const dispatch = child.actions.reduce((state, action) => action)
        return [value, dispatch(O.of("tsers!"))]
      })
      const expected = [{foo: "tsers", bar: 1}, {foo: "tsers!", bar: 1}]
      __(values, subscribeAndExpect(expected, done))
    })
  })

})


const run = (initial, fn, opts) => {
  const st = Store(initial, opts)
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
