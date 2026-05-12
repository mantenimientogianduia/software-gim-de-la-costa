import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';
import nextPlugin from '@next/eslint-plugin-next';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['dist/**/*', '.next/**/*']
  },
  {
    files: ['*.rules'],
    plugins: {
      '@firebase/security-rules': firebaseRulesPlugin
    },
    rules: firebaseRulesPlugin.configs['flat/recommended'].rules
  }
];
