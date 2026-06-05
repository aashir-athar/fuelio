// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      // eslint-plugin-react-hooks v6 (React Compiler) statically flags Reanimated
      // shared-value mutations (`sharedValue.value = ...`) inside worklets and gesture
      // handlers as immutability violations. Shared values are mutable by design, so
      // this rule produces false positives on standard, correct Reanimated code.
      'react-hooks/immutability': 'off',
    },
  },
]);
