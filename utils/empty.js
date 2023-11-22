/* return if variable is empty or not. */
exports.empty = function (mixedVar) {
  var undef, key, i, len;
  var emptyValues = [undef, null, false, 0, "", "0"];
  for (i = 0, len = emptyValues.length; i < len; i++) {
    if (mixedVar === emptyValues[i]) {
      return true;
    }
  }
  if (typeof mixedVar === "object") {
    for (key in mixedVar) {
      return false;
    }
    return true;
  }
  return false;
};
