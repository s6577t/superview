Superview.Restrictions = (function () {

  Restrictions = function (restrictions) {
    restrictions = restrictions || {};
    Object.extend(this).withObject(restrictions);
    this.minimum = new Superview.Rect(restrictions.minimum);
    this.maximum = new Superview.Rect(restrictions.maximum);
  }

  Restrictions.prototype = {
    flatten: function () {
      var flat = {};

      flat.minimum = this.minimum.flatten();
      flat.maximum = this.maximum.flatten();

      return flat;
    }
  };

  ['Minimum', 'Maximum'].forEach(function (limit) {
    Restrictions.prototype['has' + limit] = function () {
      return typeof this[limit.toLowerCase()] === 'object';
    }
  })

  return Restrictions;
})();

