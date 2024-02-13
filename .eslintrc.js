module.exports = {
    env: {
        browser: true,
        node: true,
        es2021: true,
    },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
    overrides: [
        {
            env: {
                node: true,
            },
            files: ['.eslintrc.{js,cjs}'],
            parserOptions: {
                sourceType: 'script',
            },
        },
    ],
    parserOptions: {
        ecmaVersion: 'latest',
    },
    rules: {
        semi: ['error', 'always'],
        'no-useless-catch': 0,
        'no-redeclare': 0,
        'no-case-declarations': 0,
        'no-undef': 0,
        'no-useless-escape': 0,
        'no-inner-declarations': 0,
        '@typescript-eslint/no-var-requires': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-unused-vars': 0,
    },
};
