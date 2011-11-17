Superview.CssFilter = (function () {

  function normalizeKey (cssKey) {
    return cssKey.toLowerCase().replace(/-/g, '');
  }

  var filters = [
    /^margin.*/,
    /^padding.*/,
    /^(min|max).*$/,
    /^(left|right|top|bottom|width|height)$/
  ];

  return {
    isAllowed: function (cssKey) {
      cssKey = normalizeKey(cssKey);

      for (var i = 0; i < filters.length; i++) {
        if (cssKey.match(filters[i])) return false;
      }

      return true;
    }
  } 
})()