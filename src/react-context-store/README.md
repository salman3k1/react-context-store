[React context store](https://github.com/salman3k1/react-context-store) is a react store with persistent browser storage support, inspired by the classic redux setup but created using only the react context api and hooks. It gives a simple provider component to wrap the components that need to share the state and a hook to access the context for any of the providers by name. I created it for a personal project and have used it at the global level by wrapping the App component with the provider. However, the package is flexible enough to be used for managing multiple contexts across the application.

## Getting Started

To install the package using npm you can use
```
npm install --save @salman3k1/react-context-store
```

If you are using yarn you can run
```
yarn add @salman3k1/react-context-store
```

### Usage

The provider component mainly needs two props to work correctly. A reducers object and a name (string). So first thing should be to get the reducers object ready. Value of reducers should be a flat object with each of its property set to an individual reducer. While react-context-store doesn't dictate the way you should structure your files and directories, the reducer and action files do follow a specific format. To elaborate we'll use the demo counter app from the [github repository](https://github.com/salman3k1/react-context-store). We'll create a folder named store in the src directory. This folder will contain all things related to our store. For each individual state, we'll create a directory that will hold both the actions and the reducer file for the state (Again following the same directory structure is not necessary). For this example we need a counter state so we have created a directory named counter with two files i-e actions.js and reducer.js. 

#### actions.js

The actions.js file should export an actions object each of whose properties should be an action function. This is a special function that will have the dispatch function for the reducer and the store object made available to it by react-context-store. Following the example, our action.js file should look like this:

```javascript
export const actionConstants = {
    INCREMENT: "INCREMENT",
    DECREMENT: "DECREMENT"

}
export const actions = {
  increment: (count) => {
    return (dispatch, store) => {
      dispatch({
        type: actionConstants.INCREMENT,
        payload: count,
      })
    }
  },

  decrement: (count) => {
    return (dispatch, store) => {
      dispatch({
        type: actionConstants.DECREMENT,
        payload: count,
      })
    }
  },
}
```

##### Dispatching an action

As you can see, the actions object has two actions. Increment and decrement. Each of the action function returns a function which will have dispatch and the store made available to it. To dispatch the action you can simply call the injected dispatch function.

##### Dispatching an action to a different reducer

 This package uses useReducer hook under the hood, and thus the dispatch function is valid only for the current set of actions within this actions object. If you want to dispatch an action to another reducer, you can access it via the store object. Store object is going to have two properties, actions and state where actions represent the actions object for the reducer (such as the one in the example above) and state will represent the current state of reducer. To elaborate if you have a another reducer named auth with an action setLanguage, to use it within the increment action you can do something like this:

```javascript
...
  increment: (count) => {
    return (dispatch, store) => {
      dispatch({
        type: actionConstants.INCREMENT,
        payload: count,
      })

      store.auth.actions.setLanguage("en");

    }
  }
...
```

#### reducer.js

The reducer file will export an object with four properties:
* defaultState: An object representing the default state of reducer that will be passed to the useReducer hook
* persistentProps: An array of strings each of which represents a property from the reducer that should be persisted to the local browser storage
* reducer: The reducer function that will be passed to the useReducer hook
* actions: Corresponding actions for the reducer (The ones exported from the actions file in our example)



```javascript
import { actions, actionConstants }  from './actions';
const defaultState = {
  count:0,
  lastCount:0,
};

const persistentProps = [
  'lastCount',
];

const reducer = (state , action) => {
  switch (action.type) {
    case actionConstants.INCREMENT:
      return { ...state, count: state.count+action.payload, lastCount:state.lastCount+action.payload };
    case actionConstants.DECREMENT:
      return { ...state, count: state.count-action.payload, lastCount:state.lastCount-action.payload };
    default:
      return state;
  }
};
export default {
  defaultState, persistentProps, reducer, actions
}
```
#### reducers.js

The reucers.js file has been used to import all the individual reducers, populate a flat object, and export it. This exported value will then be passed to the reducer prop of the provider component.

```javascript
import CounterReducer from './counter/reducer'

const reducers = {
    counter: CounterReducer,
  
}

export default reducers;
```

#### The provider component

To create a store we'll need to wrap the components that require the shared store with the provider component from react-context-store. For this example we are wrapping the whole App with a global store.

```javascript
import { ReactContextStoreProvider } from './react-context-store/src';
import reducers from './store/reducers';

<ReactContextStoreProvider
      reducers={reducers}
      name="root"
      otherData={{
        config: {
          postsPerPage: 2
        }
      }}
    >
      <App />
</ReactContextStoreProvider>
```

The provider component accepts three props:
* reducers: The combined reducers object from our reducers.js file
* name: Optional name of the context as a string. This name will be used to access the context related to the store inside our components. Defaults to 'default'
* otherData: An optional object containing data that won't change. Not necessarily part of the state but useful if you wan't to keep some data handy along with the context. For this example, we are storing a configuration object in the store. The value of postsPerPage can be accessed like store.config.postsPerPage later on.

#### The useStoreContext hook

To access the state within any child component we'll use the useStoreContext provided by react-context-store. In our App component, we'll call the hook and pass the name of our store to get its context. Then we'll use the current state and call some actions on it.

```javascript
import { useStoreContext } from './react-context-store/src';

function App() {
  const appStore = useStoreContext('root');
  const counterActions = appStore.counter.actions;
  const counterState = appStore.counter.state;
  return (
    <div className="App">
       <h1>This Count is from the regular state: {counterState.count}</h1>
       <h1>This Count should persist: {counterState.lastCount}</h1>
       <button onClick={()=>{counterActions.increment(1)}} >+</button>
       <button onClick={()=>{counterActions.decrement(1)}} >-</button>
    </div>
  );
}
```

#### Using the persistentProps feature

As explained above in the reducers.js file we listed the lastCount property under the persistentProps array. These props will be watched by react-context-store and will be automatically saved to the local browser storage when they change. When the app boots up, they will be automatically retrieved and set after the first render. There might be instances when you want to check if these properties have been hydrated. To tackle this issue, for any reducers with persistentProps, react-context-store will inject an extra boolean property to the state object with the key of 'restoredPersistentProps'. Value of this property will be initially set to false and will be set to true once an attempt to retrieve the value from the local storage has been completed. If you wan't to execute any logic that depends on the value of a persistent property, you can check the value of restoredPersistentProps before executing your logic. An example can be:

```javascript
import { useStoreContext } from './react-context-store/src';

if(counterState.restoredPersistentProps){
    console.log("Counter value has been restored from the local storage", counterState.lastCount);
}

```
### Final Note

I have created this package for an ongoing project and have my hands full at the moment. I'll try my best to work on the reported issues but if you find the package useful and see any room for improvement (Or can fix any bugs), feel free to submit a pull request. Thanks


## Authors

* **Muhammad Salman Abid**

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/salman3k1/react-context-store/blob/master/LICENSE.md) file for details

