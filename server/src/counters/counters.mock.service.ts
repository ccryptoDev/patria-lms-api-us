export const CounterServiceMock = {
    getNextSequenceValue(type, requestId) {
        return {
            sequenceValue: Math.floor(Math.random() * 10) + 1 + '',
            appType: type
        };
    }
}
