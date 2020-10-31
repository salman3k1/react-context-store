import React from 'react';
import './App.css';
import { useStoreContext } from './react-context-store/src';

function App() {
  const appStore = useStoreContext('root');
  const counterActions = appStore.counter.actions;
  const counterState = appStore.counter.state;
  return (
    <div className="App">
       <h1>This Count is from the regular state: {counterState.count}</h1>
       <h1>This Count should persist: {counterState.lastCount}</h1>
       <button onClick={()=>{counterActions.increment(1)}} style={{padding:20, fontSize:30}}>+</button>
       <button onClick={()=>{counterActions.decrement(1)}} style={{padding:20, fontSize:30}}>-</button>
    </div>
  );
}

export default App;
