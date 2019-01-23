import { createContext, useState, useEffect, useContext, useMemo } from 'react'
import { bindActionCreators } from 'redux'

const is = 'is' in Object ? Object.is : (a, b) => {
  if (a === b) {
    // strictly equal, but not functionally: -0 is not funcitonally equal to +0
    // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness#Same-value_equality
    return a !== 0 || b !== 0 || 1 / a === 1 / b
  }
  // if values not equal to themselves, assume NaN
  return a !== a && b !== b
}

/**
 * Get a property within the passed object bu the passed `path` (dot separated)
 */
const get = (obj, path) => path.split('.').reduce((acc, part) => acc[part], obj)

/**
 * getMapper will attempt to create and return a mapper function if a string is
 * passed to it. Otherwise it simply returns what it was passed.
 */
const getMapper = mapState => {
  if (typeof mapState === 'string') {
    return state => get(state, mapState)
  }
  return mapState
}

/**
 * Determine whether `a` and `b` are equal, or in the case of both being objects
 * shallowly compare them.
 */
const shallowEq = (a, b) => {
  if (is(a,b)) return true

  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false
  }

  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false

  for (let i = 0; i < aKeys.length; i++) {
    if (!b.hasOwnProperty(aKeys[i]) || !is(a[aKeys[i]], b[bKeys[i]])) {
      return false
    }
  }
    return true
}

const StoreContext = createContext(null)
const _useStore = () => {
  const store = useContext(StoreContext)
  if (!store || !store.dispatch || !store.getState) {
    throw new Error(
      'You must use the <Provider> component and refer the value prop to your Redux store',
    )
  }

  return store
}
export const Provider = StoreContext.Provider

export const useStoreState = mapState => {
  const store = _useStore()
  const mapper = useMemo(() => getMapper(mapState), [mapState])
  const [state, setState] = useState(mapper(store.getState()))

  useEffect(() => {
    return store.subscribe(() => {
      const nextState = mapper(store.getState())

      if (!shallowEq(state, nextState)) {
        setState(mapper(store.getState()))
      }
    })
  })

  return state
}

export const useDispatch = () => {
  const store = _useStore()
  return store.dispatch
}

export const useActions = actions => {
  if (!actions) return null

  const dispatch = useDispatch()
  const boundActions = useMemo(() => bindActionCreators(actions, dispatch), [
    actions,
  ])
  return boundActions
}

export const useStore = (mapState, actions) => {
  const state = useStoreState(mapState)
  return [state, useActions(actions), useDispatch()]
}
