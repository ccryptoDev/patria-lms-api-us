type LayoutState = {
  step: number;
  isLoading: boolean;
};

export default {
  state: {
    step: 1,
    isLoading: false,
  },

  mutations: {
    setStep(state: LayoutState, step: number) {
      state.step = step;
    },
    setIsLoading(state: LayoutState, isLoading: boolean) {
      state.isLoading = isLoading;
    },
  },
};
