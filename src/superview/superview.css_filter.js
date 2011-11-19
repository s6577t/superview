Superview.CssFilter = (function () {

  function normalizeKey (cssKey) {
    return cssKey.toLowerCase().replace(/-/g, '');
  }

  var filters = [
    /^margin.*/i,
    /^padding.*/i,
    /^(min|max).*$/i,
    /^(left|right|top|bottom|width|height)$/i,
    /^position$/i,
    /^display$/i
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