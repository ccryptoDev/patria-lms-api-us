type LoanRow = any;

interface LoanTableEntriesState {
  entries: { [screenId: string]: LoanRow };
}

export const loanTableEntries = {
  namespaced: true,
  state: (): LoanTableEntriesState => ({ entries: {} }),
  getters: {
    getEntry: (state: LoanTableEntriesState) => (screenId: string) => {
      return state.entries[screenId];
    },
  },
  mutations: {
    setEntries(
      state: LoanTableEntriesState,
      payload: { idKeyName: string; entries: LoanRow[] }
    ) {
      const newEntries = payload.entries.reduce(
        (dict, entry) => ({ ...dict, [entry[payload.idKeyName]]: entry }),
        {}
      );
      state.entries = { ...state.entries, ...newEntries };
    },
  },
  actions: {},
};
