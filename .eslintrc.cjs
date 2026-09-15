module.exports = {
  root: true,
  extends: ["@remotion/eslint-config"],
  ignorePatterns: ["generated/**", "public/.work/**", "dist/**"],
  rules: {
    "no-console": "off",
    camelcase: "off",
    "react/prefer-read-only-props": "off",
    complexity: "off",
    "no-useless-constructor": "off",
    "prefer-destructuring": "off",
  },
};
