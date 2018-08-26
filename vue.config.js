module.exports = {
  css: {
    loaderOptions: {
      // pass options to sass-loader
      sass: {
        includePaths: [
          'node_modules'
        ],
        // @/ is an alias to src/
        // so this assumes you have a file named `src/variables.scss`
        data: `@import "~materialize-css/sass/materialize.scss";`
      }
    }
  }
}

