export const createMutations = (state) => {
  const mutations = {}
  for (let key in state) {
    mutations[ key ] = (state, payload) => {
      state[ key ] = payload
    }
  }
  mutations.set = (state, {key, value}) => {
    state[ key ] = value
  }

  mutations.delete = (state, key) => {
    delete state[ key ]
  }
  return mutations
}

export const createResetAction = (DEFAULT_STATE) => {
  return ({ commit, state}) => {
    Object.keys(DEFAULT_STATE).forEach(key => {
      commit(key, DEFAULT_STATE[ key ])
    })

    Object.keys(state).forEach(key => {
      if (!DEFAULT_STATE[ key ]) {
        commit('delete', key)
      }
    })
  }
}