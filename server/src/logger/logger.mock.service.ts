export const LoggerMockService = {
  log(message: string, context: string, requestId = '', obj?: any): void {
    console.log(`[${context}]${requestId} ${message}`);
  },
  error(message: string, context: string, requestId = '', obj?: any): void {
    console.log(`[${context}]${requestId} ${message}`);
  },
  warn(message: string, context: string, requestId = '', obj?: any): void {
    console.log(`[${context}]${requestId} ${message}`);
  },
  debug(message: string, context: string, requestId = '', obj?: any): void {
    console.log(`[${context}]${requestId} ${message}`);
  },
  verbose(message: string, context: string, requestId = '', obj?: any): void {
    console.log(`[${context}]${requestId} ${message}`);
  },
};
