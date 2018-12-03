import { createContext, useState, useEffect, useContext, useMemo } from 'react'
import { bindActionCreators } from 'redux'

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
 * Determine wether `a` and `b` are equal, or in the case of both being objects
 * shallowly compare them.
 */
const shallowEq = (a, b) => {
  if (typeof a !== 'object' || typeof b !== 'object') {
    return a === b
  }
  const aValues = Object.values(a)
  const bValues = Object.values(b)
  if (aValues.length !== bValues.length) return false

  return Object.entries(a).every(([key, value]) => {
    return b[key] === value
  })
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
  const dispatch = useDispatch()
  const boundActions = useMemo(() => bindActionCreators(actions, dispatch), [
    actions,
  ])
  return boundActions
}

export const useStore = (mapState, actions = []) => {
  const state = useStoreState(mapState)
  return [state, useActions(actions), useDispatch()]
}
