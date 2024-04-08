module.exports = {
  root: true,
  plugins: ['stylelint-order'],
  extends: [
    'stylelint-config-standard',
    'stylelint-config-html',
    'stylelint-config-prettier',
    'stylelint-config-recess-order',
    'stylelint-config-recommended-less',
    'stylelint-config-recommended-vue',
  ],
  overrides: [
    {
      files: ['**/*.(less|css|vue|html)'],
      customSyntax: 'postcss-less',
    },
    {
      files: ['**/*.(html|vue)'],
      customSyntax: 'postcss-html',
    },
  ],

  rules: {
    'no-descending-specificity': null,
  },
  ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.tsx', '**/*.ts', 'dist/**/*'],
};
