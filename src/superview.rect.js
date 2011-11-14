Superview.Rect = (function () {

  Rect = function (rect) {
    Object.extend(this).withObject(rect);
  }

  Rect.prototype = {
    has: function (member) {
      return this['has' + member.variableize(true)]();
    },
    flatten: function () {
      var self = this,
          flat = {};

      ['top', 'left', 'bottom', 'right', 'width', 'height'].forEach(function (member) {
        if (typeof self[member] !== 'undefined') {
          flat[member] = self[member];
        }
      });

      return flat;
    }
  };

  ['Top', 'Right', 'Bottom', 'Left'].forEach(function (edge) {
    Rect.prototype['has' + edge] = function () {
      var edgeValue = this[edge.toLowerCase()];
      return (typeof edgeValue === 'number') && !isNaN(edgeValue) && edgeValue !== Infinity
    }
  });

  ['Width', 'Height'].forEach(function (dimension) {
    Rect.prototype['has' + dimension] = function () {
      var dimensionValue = this[dimension.toLowerCase()];
      return (typeof dimensionValue === 'number') && !isNaN(dimensionValue) && dimensionValue !== Infinity && dimensionValue >= 0;
    }
  });

  return Rect;
})();