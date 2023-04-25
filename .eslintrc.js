//eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: true,
    es2021: true,
    "jest/globals": true,
    "cypress/globals": true,
  },
  extends: ["eslint:recommended", "plugin:jest/recommended", "prettier"],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "prettier/prettier": "error",
  },
  plugins: ["prettier", "jest", "cypress"],
};
