//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config";

export default [
  ...tanstackConfig,
  {
    ignores: ["dev-dist/**", "*.config.js", "*.config.ts"],
  },
];
