# redux-hooker

redux-hooker is a library providing simple & easy-to-use redux hooks for React.

## Installation

```sh
$ npm i redux-hooker
```

## Getting Started

Quick getting started diff showing use with create-react-app.

**App.js**
```diff
 import React, { Component } from 'react';
 import logo from './logo.svg'
 import './App.css'
+import store from './store' // redux store instance
+import { Provider } from 'redux-hooker'

class App extends Component {
    render() {
        return (
            <Provider value={store}>
                <Main />
            </Provider>
        )
    }
}
``` 

**Main.js**
```js
import React from 'react';
import { useStoreState } from 'redux-hooker'

export default Main () => {
    const username = useStoreState('user.username') // assuming your redux store contains a user with a username
    return (
        <header><h1>Hello {username}!</h1></header>
    )
}
``` 

## Documentation

### useStoreState

`useStoreState` will subscribe to the redux store and re-render the component whenever the selected state has changed. You may pass it a path (e.g. `app.menu.selected`) or a mapper function (e.g. `state => state.app.menu.selected`).

Example:
```js
const CounterDisplay = () => {
    counst count = useStoreState('count') // or useStoreState(state => state.count)
    return <p>Count: {count}</p>
}
```

### useDispatch

`useDispatch` returns the dispatch function of the Redux store so that you may dispatch actions.

Example:
```js
const IncrementButton = () => {
    const dispatch = useDispatch()
    return <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
}
```

### useActions

`useActions` will bind the passed actions creators to the dispatch function using the `bindActionCreators` function from Redux. 

**IMPORTANT:** Do not pass `useActions` a new object reference each render, or the memoization will fail and `bindActionCreators` will be called on every render. Instead, use a memoization function or simply keep your actions out of the function scope. For most cases the latter is preferable.

Example:
```js
import * as counterActions from './actions/counter'
// OR
const counterActions = { incremnet: () => ({ type: 'INCREMENT' }), decrement: () => ({ type: 'DECREMENT' }) }
const CounterActions = () => {
    const actions = useActions(counterActions) // counterActions will reference the same object every render
    return (
        <button onClick={actions.increment}>+</button>
        <button onClick={actions.decrement}>-</button>
    )
}
```

Another example where we "dynamically" swap action creators depending on a prop:
```js
const userActions = { create: () => ({ type: 'CREATE_USER', ... }), ... }
const groupActions = { create: () => ({ type: 'CREATE_GROUP', ... }), ... }

const CreateForm = ({ type }) => {
    const actions = useActions(type === 'user' ? userActions : groupActions)

    return (
      ...
      <button onClick={actions.create}>Create {type}</button>
    )
}
```

### useStore

`useStore` is a composition of `useStoreState`, `useActions` & `useDispatch`. It returns an array containing: the state, the bound action creators, the dispatch function.

Example:
```js
const Counter = () => {
  const [ count, actions, dispatch ] = useStore('count', counterActions)
  return (
    <Fragment>
        <button onClick={actions.increment}>+</button>
        <button onClick={actions.decrement}>-</button>
        <p>Count: {count}</p>
    </Fragment>
  )
}
```

### <Provider />

`<Provider />` is very similar to the Provider component of react-redux for those of you who have used it. It is a simple context provider, which takes a `value` prop pointing to the store instance. It should be used a the top level of your react tree so that all other components can use the hooks provided by redux-hooker. 

```js
import { createStore, combineReducers } from 'redux'
import { Provider } from 'redux-hooker'

const store = createStore(combineReducers({ .... }))

const App = () => ({
    <Provider value={store}>
        <Main />
    </Provider>
})
```
