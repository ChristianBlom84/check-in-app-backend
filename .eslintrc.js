module.exports = {
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'ecmaVersion': 2018,
        'sourceType': 'module',
    },
    'plugins': [
        '@typescript-eslint',
        'prettier'
    ],
    'env': {
        'browser': true,
        'es6': true,
        'jest': true,
        'node': true,
        'jasmine': true
    },
    'extends': [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
        'plugin:prettier/recommended'

    ],
    'rules': {
        '@typescript-eslint/interface-name-prefix': 'off',
        'prettier/prettier': [
            'error',
            {
                'singleQuote': true,
                'tabWidth': 2
            }
        ]
    }
};