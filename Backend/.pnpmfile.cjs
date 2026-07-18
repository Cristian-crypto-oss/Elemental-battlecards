function readPackage(pkg, context) {
  // Permitir que sqlite3 se compile
  if (pkg.name === 'sqlite3') {
    pkg.scripts = pkg.scripts || {}
    context.log('Permitiendo compilación de sqlite3')
  }
  return pkg
}

module.exports = {
  hooks: {
    readPackage
  }
}
