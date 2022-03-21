export const createMutations = (state) => {
  const mutations = {}
  for (let key in state) {
    mutations[ key ] = (state, payload) => {
      state[ key ] = payload
    }
  }
  return mutations
}

export const createResetAction = (state) => {
  return ({ commit }) => {
    Object.keys(state).forEach(key => {
      commit(key, state[ key ])
    })
  }
}