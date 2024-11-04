module.exports = {
    root: true,
    env: {
      node: true,
      es2021: true
    },
    parserOptions: {
      ecmaVersion: 2021,
      parser: '@typescript-eslint/parser',
      sourceType: 'module'
    },
    extends: [
      'eslint:recommended',
      'plugin:vue/vue3-essential',
      'plugin:@typescript-eslint/recommended'
    ],
    rules: {
      'no-unused-vars': 'warn',             // Avisa sobre variáveis não utilizadas
      'no-undef': 'warn',                    // Avisa sobre variáveis indefinidas
      '@typescript-eslint/no-explicit-any': 'off', // Permite uso de any para flexibilidade
      'vue/no-unused-components': 'warn'     // Avisa sobre componentes Vue não usados
    }
  };