import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';
import nextPlugin from '@next/eslint-plugin-next';

export default [
  { ignores: ['.next/**', 'node_modules/**', 'dist/**'] },
  {
    plugins: { '@next/next': nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
  firebaseRulesPlugin.configs['flat/recommended']
];
