type ContractState = {
  date: string;
  paymentScheduleInfo: Record<string, unknown>;
  provider: Record<string, unknown>;
  screenTracking: Record<string, unknown>;
  selectedOffer: Record<string, unknown>;
  userData: Record<string, unknown>;
  signature: string;
};

export default {
  state: {
    date: undefined as undefined | string,
    paymentScheduleInfo: undefined as undefined | Record<string, unknown>,
    provider: undefined as undefined | Record<string, unknown>,
    screenTracking: undefined as undefined | Record<string, unknown>,
    selectedOffer: undefined as undefined | Record<string, unknown>,
    userData: undefined as undefined | Record<string, unknown>,
    signature: undefined as undefined | string,
  },
  mutations: {
    setProvider(state: ContractState, provider: Record<string, unknown>) {
      state.provider = provider;
    },
    setPaymentScheduleInfo(
      state: ContractState,
      paymentScheduleInfo: Record<string, unknown>
    ) {
      state.paymentScheduleInfo = paymentScheduleInfo;
    },
    setScreenTracking(
      state: ContractState,
      screenTracking: Record<string, unknown>
    ) {
      state.screenTracking = screenTracking;
    },
    setSelectedOffer(
      state: ContractState,
      selectedOffer: Record<string, unknown>
    ) {
      state.selectedOffer = selectedOffer;
    },
    setUserData(state: ContractState, userData: Record<string, unknown>) {
      state.userData = userData;
    },
    setDate(state: ContractState, date: string) {
      state.date = date;
    },
    setSignature(state: ContractState, signature: string) {
      state.signature = signature;
    },
  },
};
