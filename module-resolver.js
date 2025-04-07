module.exports = (source) => {
  // Replace imports from '@mysten/sui/utils' with '@mysten/sui.js/utils'
  return source
    .replace(/from ['"]@mysten\/sui\/utils['"]/g, "from '@mysten/sui.js/utils'")
    .replace(/fromBase64/g, "fromB64")
    .replace(/toBase64/g, "toB64")
}

