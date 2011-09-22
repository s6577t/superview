Superview.CssFilter = (function () {

  function normalizeKey (cssKey) {
    return cssKey.toLowerCase().replace(/-/g, '');
  }

  var filters = [
    /^margin.*/,
    /^padding.*/
    // 'margin-top',
    // 'margin-left',
    // 'margin-right',
    // 'margin-bottom',
    // 'marginRight',
    // 'marginBottom',
    // 'padding',
    // 'padding-top',
    // 'padding-bottom',
    // 'padding-left',
    // 'padding-right',
    // 'paddingRight',
    // 'PADDING-RIGHT',
    // 'left', 
    // 'top', 
    // 'bottom', 
    // 'right', 
    // 'max-width', 
    // 'max-height', 
    // 'min-width', 
    // 'min-height', 
    // 'minWidth',  
    // 'width', 
    // 'height', 
  ];

  return {
    allowed: function (cssKey) {
      cssKey = normalizeKey(cssKey);

      for (var i = 0; i < filter.length; i++) {
        if (cssKey.match(filters[i])) return false;
      }

      return true;
    }
  } 
})()