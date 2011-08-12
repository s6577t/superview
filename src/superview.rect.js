(function () {
  Superview.Rect = function (dimensions) {
    dimensions = (typeof dimensions === 'object') ? dimensions : {}; 
    
    this._w = parseInt(dimensions.width  || 0);
    this._h = parseInt(dimensions.height || 0);
    this._l = parseInt(dimensions.left   || 0);
    this._t = parseInt(dimensions.top    || 0);
    
    if (typeof dimensions.right === 'number' && this._l === 0) {
      this.right(dimensions.right);
    }
    
    if (typeof dimensions.bottom === 'number' && this._t === 0) {
      this.bottom(dimensions.bottom);
    }
  }
  
  Superview.Rect.prototype = {
    width: function (w) {
      if (typeof w === 'number') {
        this._w = w;
        return this;
      }
      return this._w;
    },
    height: function (h) {
      if (typeof h === 'number') {
        this._h = h;
        return this;
      }
      return this._h;
    },
    top: function (t) {
      if (typeof t === 'number') {
        this._t = t;
        return this;
      }
      return this._t;
    },
    left: function (l) {
      if (typeof l === 'number') {
        this._l = l;
        return this;
      }
      return this._l;
    },
    right: function (r) {
      if (typeof r === 'number') {
        return this.left(r - this._w);
      }
      return this._l + this._w;
    },
    bottom: function (b) {
      if (typeof b === 'number') {
        return this.top(b - this._h);
      }
      return this._t + this._h;
    },
    equals: function (superviewRectOrCtorArg) {
      if (!(superviewRectOrCtorArg instanceof Superview.Rect)) {
        superviewRectOrCtorArg = new Superview.Rect(superviewRectOrCtorArg);
      }
      var superviewRect = superviewRectOrCtorArg;
      return this.width() === superviewRect.width() &&
             this.height() === superviewRect.height() &&
             this.left() === superviewRect.left() &&
             this.top() === superviewRect.top();
    }
  }
})();