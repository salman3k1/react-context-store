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