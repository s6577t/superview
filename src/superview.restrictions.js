(function () {

  Superview.Restrictions = function (restrictions) {
    extend(this).withObject(restrictions);
    this.minimum = new Superview.Rect(restrictions.minimum);
    this.maximum = new Superview.Rect(restrictions.maximum);
  }

  Superview.Restrictions.prototype = {
    flatten: function () {

      var flat = {};

      flat.minimum = restrictions.minimum.flatten();
      flat.maximum = restrictions.maximum.flatten();

      return flat;
    }
  };

  ['Minimum', 'Maximum'].forEach(function (limit) {
    Superview.Restrictions.prototype['has' + limit] = function () {
      return typeof this[limit.toLowerCase()] === 'object';
    }
  })

})();