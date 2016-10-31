import R from "ramda"
import {byType} from "../src/index"


describe("Utility functions", () => {
  describe("byType", () => {
    it("delegates reducers by action type", () => {
      const reducer = byType({
        ADD: R.flip(R.append),
        REMOVE: (s, id) => R.reject(R.whereEq({id}), s)
      })
      reducer(["foo"], {type: "ADD", payload: "bar"}).should.eql(["foo", "bar"])
      reducer([{id: 1}], {type: "REMOVE", payload: 2}).should.eql([{id: 1}])
      reducer([{id: 1}], {type: "REMOVE", payload: 1}).should.eql([])
    })

    it("does nothing if action type doesn't match the pre-defined reducers", () => {
      const reducer = byType({
        ADD: R.append
      })
      const state = ["foo"]
      reducer(state, null).should.eql(state)
      reducer(state, {}).should.eql(state)
      reducer(state, {type: "TSERS"}).should.eql(state)
    })
  })
})
