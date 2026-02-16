type CheckUrlResult =
    | {
          validUrl: true;
          url: string;
          protocol: string;
          urlObject: URL;
      }
    | {
          validUrl: false;
          error: Error;
          url: string;
      };

export const checkURL = (value: string): CheckUrlResult => {
    try {
        const result = new URL(value);
        return {
            validUrl: true,
            url: value,
            protocol: result.protocol,
            urlObject: result,
        };
    } catch (error: unknown) {
        return {
            validUrl: false,
            error: error as TypeError,
            url: value,
        };
    }
};
