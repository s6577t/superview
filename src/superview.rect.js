(function () {
  
  Superview.Rect = function (rect) {
    extend(this).withObject(rect);
  }
  
  Superview.Rect.prototype = {};
  
  ['Top', 'Right', 'Bottom', 'Left'].forEach(function (edge) {
    Superview.Rect.prototype['has' + edge] = function () {
      var edgeValue = this[edge.toLowerCase()];
      return (typeof edgeValue === 'number') && edgeValue !== NaN && edgeValue !== Infinity
    }
  });
  
  ['Width', 'Height'].forEach(function (dimension) {
    Superview.Rect.prototype['has' + dimension] = function () {
      var dimensionValue = this[dimension.toLowerCase()];
      return (typeof dimensionValue === 'number') && dimensionValue !== NaN && dimensionValue !== Infinity && dimensionValue >= 0;
    }
  });
  
})();