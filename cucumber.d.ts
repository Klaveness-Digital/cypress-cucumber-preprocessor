declare module "@cucumber/cucumber" {
  interface IWorld {
    tmpDir: string;
    verifiedLastRunError: boolean;
    lastRun: {
      stdout: string;
      stderr: string;
      output: string;
      exitCode: number;
    };
  }
}

export {};
