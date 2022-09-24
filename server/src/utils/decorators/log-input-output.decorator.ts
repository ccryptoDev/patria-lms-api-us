export const LogInputOutput = (requestIdArgIndex = 0): MethodDecorator => {
  return (
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    console.log(
      'function =========',
      `${target.constructor.name}#${propertyKey}`,
    );

    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const requestId = args[requestIdArgIndex];

      if (!requestId || typeof requestId !== 'string') {
        throw new Error("'requestId' is required");
      }

      this.logger.log(
        'Input:',
        `${target.constructor.name}#${propertyKey}`,
        requestId,
        args,
      );

      const res = await originalMethod.apply(this, args);

      this.logger.log(
        'Output:',
        `${target.constructor.name}#${propertyKey}`,
        requestId,
        res,
      );
    };

    return descriptor;
  };
};
