
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
