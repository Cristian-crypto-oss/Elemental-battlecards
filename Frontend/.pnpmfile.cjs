function readPackage(pkg, context) {
  // Permitir que esbuild se compile
  if (pkg.name === 'esbuild') {
    pkg.scripts = pkg.scripts || {}
    context.log('Permitiendo compilación de esbuild')
  }
  return pkg
}

module.exports = {
  hooks: {
    readPackage
  }
}
