/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@imageflow/eslint-config/library.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true
  }
};
