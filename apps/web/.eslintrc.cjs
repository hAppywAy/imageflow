/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@imageflow/eslint-config/react.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off'
  }
};
