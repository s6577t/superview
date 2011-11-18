Superview.Rect = (function () {

  Rect = function (rect) {
    Object.extend(this).withObject(rect);
  }

  Rect.prototype = {
    has: function (member) {
      return this['has' + member.variableize(true)]();
    }
    , flatten: function () {
      var self = this,
          flat = {};

      ['top', 'left', 'bottom', 'right', 'width', 'height'].forEach(function (member) {
        if (typeof self[member] !== 'undefined') {
          flat[member] = self[member];
        }
      });

      return flat;
    }
    , removeBorder: function (borderMetrics) {
      if (this.hasWidth()) {
        this.width -= borderMetrics.width;
      }
      if (this.hasHeight()) {
        this.height -= borderMetrics.height;
      }
      if (this.hasTop()) {
        this.top += borderMetrics.top;
      }
      if (this.hasLeft()) {
        this.left += borderMetrics.left;
      }
      if (this.hasRight()) {
        this.right -= borderMetrics.right;
      }
      if (this.hasBottom()) {
        this.bottom -= borderMetrics.bottom;
      }
      return this;
    }
    , addBorder: function (borderMetrics) {
      if (this.hasWidth()) {
        this.width += borderMetrics.width;
      }
      if (this.hasHeight()) {
        this.height += borderMetrics.height;
      }
      if (this.hasTop()) {
        this.top -= borderMetrics.top;
      }
      if (this.hasLeft()) {
        this.left -= borderMetrics.left;
      }
      if (this.hasRight()) {
        this.right += borderMetrics.right;
      }
      if (this.hasBottom()) {
        this.bottom += borderMetrics.bottom;
      }
      return this;      
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