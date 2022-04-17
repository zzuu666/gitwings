// annotated options are as default
module.exports = {
  printWidth: 120,
  tabWidth: 2,
  semi: false,
  singleQuote: true,

  // https://github.com/sveltejs/prettier-plugin-svelte/issues/155
  plugins: [require('prettier-plugin-package')],
}
