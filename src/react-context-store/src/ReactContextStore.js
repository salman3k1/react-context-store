/* eslint react-hooks/exhaustive-deps: 0 */
/* eslint array-callback-return: 0 */

import React, { createContext, useContext, useEffect, useReducer, useRef } from "react"

const RESTORE_PERSISTENT_PROP_VALUES = "RESTORE_PERSISTENT_PROP_VALUES";
const restorePropsFromLocalStorage = (state, reducerKey, persistentProps, action) => {
    let stateClone = state;
    let modified = false;
    if(persistentProps && action === RESTORE_PERSISTENT_PROP_VALUES){
        if (typeof localStorage !== 'undefined') {
            stateClone = { ...state };
            persistentProps.map((propKey) => {
                try {
                    const localVal = localStorage.getItem(`__${reducerKey}.${propKey}`);
                    if (localVal) {
                        stateClone[propKey] = JSON.parse(localVal);
                    }
                } catch (error) {
                    console.log(`>>>>: Error Fetching Local Value for ${reducerKey}.${propKey}`, error)
                }
            })
            stateClone.restoredPersistentProps = true;
            modified = true;
        }
    }
    return {state:stateClone, modified};
}

const useRootStore = (reducers) => {
    const mergedReducers = {};
    const persistentPropRefs = [];
    const reducerKeys = Object.keys(reducers);
    for(let x=0; x<reducerKeys.length; x++){
        const reducerKey = reducerKeys[x];
        // Get exports from the reducer file
        const {defaultState, persistentProps, reducer, actions} = reducers[reducerKey];
        // Modify the actual reducer to inject the restoration logic at the top
        const reducerWithLocalPropRestoration = (state, action) => {
            const restoreProps = restorePropsFromLocalStorage(state, reducerKey, persistentProps, action);
            if(restoreProps.modified){
                return restoreProps.state;
            }
            return reducer(state, action);
        }
        // Store persistent props with required info as objects
        if (persistentProps && typeof localStorage !== 'undefined') {
            let foundPersistentProps = false;
            Object.keys(defaultState).map((propKey) => {
                if (persistentProps.indexOf(propKey) > -1) {
                    foundPersistentProps = true;
                    persistentPropRefs.push({
                        reducerKey,
                        propKey
                    });
                }
            })
            // If there are any persistent props in the reducer set the restoredPersistentProps property on the default state
            if(foundPersistentProps){
                defaultState.restoredPersistentProps = false;
            }
            
        }
        // eslint-disable-next-line 
        const [state, dispatch] = useReducer(reducerWithLocalPropRestoration, defaultState);
        mergedReducers[reducerKey] = {
            state,
            actions: {},
            dispatch
        };
        Object.keys(actions).map((actionKey) => {
            mergedReducers[reducerKey].actions[actionKey] = (...actionData) => {
                actions[actionKey](...actionData)(dispatch, mergedReducers);
            }
        })
    }
    return {mergedReducers, persistentPropRefs};
}

const Contexts = {};

export const ReactContextStoreProvider = ({ name = 'default', children, reducers = {}, otherData = {} }) => {
    const { mergedReducers, persistentPropRefs } = useRootStore(reducers);
    if(!Contexts[name]){
        Contexts[name] = createContext(null);
    }

     // Add effect hook for the props that needs to be saved locally on change
    const previousPersistentPropVals = useRef();
    const persistentPropRefValues = [];

    persistentPropRefs.map((propRef) => {
        let currentVal = mergedReducers[propRef.reducerKey].state[propRef.propKey];
        persistentPropRefValues.push(currentVal);
    });

    useEffect(() => {
        // Detect changes and persist if any
        if(previousPersistentPropVals.current){
            persistentPropRefs.map((propRef, propIndex) => {
                let currentVal = mergedReducers[propRef.reducerKey].state[propRef.propKey];
                let restoredPersistentProps = mergedReducers[propRef.reducerKey].state.restoredPersistentProps;
                if(previousPersistentPropVals.current[propIndex] !== persistentPropRefValues[propIndex]){
                    // Save on change
                    if (typeof localStorage !== 'undefined') {
                        if (restoredPersistentProps) {
                            // console.log('saving');
                            try {
                                localStorage.setItem(`__${propRef.reducerKey}.${propRef.propKey}`, JSON.stringify(currentVal));
                            } catch (error) {
                                console.log(`>>>>: Error Fetching Local Value for ${propRef.reducerKey}.${propRef.propKey}`, error)
                            }
                        }
                    }
                }
            });
        }
        previousPersistentPropVals.current =  persistentPropRefValues;  
    }, persistentPropRefValues);

    // Attach any other data to the mergedReducer object that you want to be globally accessible throughout the application
    Object.keys(otherData).map((key) => {
        mergedReducers[key] = otherData[key];
    })
    

    useEffect(() => {
        Object.keys(mergedReducers).map((reducerKey) => {
            const reducer = mergedReducers[reducerKey];
            if(reducer.dispatch){
                reducer.dispatch(RESTORE_PERSISTENT_PROP_VALUES);
            }
        });
    },[])
    const Context = Contexts[name];
    return (
        <Context.Provider value={mergedReducers}>
            {children}
        </Context.Provider>
    )
}

export const useStoreContext = (name = 'default') => {
    return useContext(Contexts[name]);
}

