Superview.ContentArea = (function () {

  function ContentArea (superview) {
    this._superview = superview;
    eventify(this).define(
      'onMoved', // (source contentArea)
      'onResized' // (source contentArea)
    );
  }

  ContentArea.prototype = {
    superview: function () {
      return this._superview;
    }
    , size: function () {

      var superview = this.superview();
      var boundaryBoxSize = new Superview.Rect(superview.size());
      return boundaryBoxSize.removeBorder(superview.borderMetrics()).flatten();
    }
    , resize: function (newSize, restrictionCallback) {

      var superview = this.superview();
      newSize = new Superview.Rect(newSize);
      newSize.addBorder(superview.borderMetrics());

      superview.resize(newSize.flatten(), restrictionCallback);

      return this;
    }
    , position: function () {
      var superview = this.superview();
      var boundaryBoxPosition = new Superview.Rect(superview.position());
      return boundaryBoxPosition.removeBorder(superview.borderMetrics()).flatten();
    }
    , moveTo: function (newPosition, restrictionCallback) {

      var superview = this.superview();
      newPosition = new Superview.Rect(newPosition);
      newPosition.addBorder(superview.borderMetrics());

      superview.moveTo(newPosition.flatten(), restrictionCallback);

      return this;
    }
    , restrictTo: function (restrictions) {

      var superview = this.superview();

      restrictions = new Superview.Restrictions(restrictions);
      var borderMetrics = superview.borderMetrics();

      restrictions.minimum.addBorder(borderMetrics);
      restrictions.maximum.addBorder(borderMetrics);

      superview.restrictTo(restrictions.flatten());

      return this;
    }
    , restrictions: function () {
      var superview = this.superview();

      var restrictions = new Superview.Restrictions(superview.restrictions());
      var borderMetrics = superview.borderMetrics();

      restrictions.minimum.removeBorder(borderMetrics);
      restrictions.maximum.removeBorder(borderMetrics);

      return restrictions.flatten();
    }
    , anchorTo: function () {
      var self = this;



      return this;
    }
  }

  return ContentArea;
})();