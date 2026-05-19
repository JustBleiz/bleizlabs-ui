/** @type {import('stylelint').Config} */
const config = {
  extends: ['stylelint-config-standard-scss'],
  rules: {
    'at-rule-disallowed-list': ['import'],
    'at-rule-empty-line-before': null,
    'alpha-value-notation': null,
    'color-function-alias-notation': null,
    'color-function-notation': null,
    'comment-empty-line-before': null,
    'custom-property-pattern': null,
    'declaration-block-no-duplicate-properties': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'declaration-block-single-line-max-declarations': null,
    'declaration-empty-line-before': null,
    'declaration-no-important': true,
    'declaration-property-value-keyword-no-deprecated': null,
    'font-family-no-missing-generic-family-keyword': true,
    'keyframes-name-pattern': null,
    'media-feature-range-notation': null,
    'no-descending-specificity': null,
    'property-no-deprecated': null,
    'property-no-vendor-prefix': null,
    'property-no-unknown': [
      true,
      {
        ignoreProperties: [/^--/],
      },
    ],
    'rule-empty-line-before': null,
    'selector-class-pattern': null,
    'selector-no-vendor-prefix': null,
    'selector-not-notation': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global', 'local'],
      },
    ],
    'scss/at-rule-no-unknown': true,
    'scss/at-if-no-null': null,
    'scss/comment-no-empty': null,
    'scss/double-slash-comment-empty-line-before': null,
    'scss/dollar-variable-empty-line-before': null,
    'scss/load-partial-extension': 'never',
    'scss/dollar-variable-pattern': '^[_]?[a-z][a-z0-9-]*$',
    'scss/percent-placeholder-pattern': '^[a-z][a-z0-9-]*$',
    'value-keyword-case': null,
    'custom-property-empty-line-before': null,
  },
  overrides: [
    {
      files: ['styles/_animations.scss'],
      rules: {
        'declaration-no-important': null,
      },
    },
  ],
};

export default config;
