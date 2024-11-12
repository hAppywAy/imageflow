/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@imageflow/eslint-config/nest.js'],
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module'
  }
};