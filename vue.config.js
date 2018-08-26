module.exports = {
  css: {
    loaderOptions: {
      sass: {
        includePaths: ['node_modules'],
        // ~ is an alias to node_modules/
        data: `@import "~materialize-css/sass/materialize.scss";`
      }
    }
  }
}

