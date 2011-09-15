(function () {
  
  Superview.Rect = {
    /* all rect MUST have a top and left */
    samePosition: function () {
      var args = arguments;
      var rectA = args[0];
      for (var i = 1; i < args.length; i++) {
        var rectB = args[i];
        if (rectB.top !== rectA.top && rectB.left !== rectA.left) return false;
      }
      return true;
    },
    sameSize:     function () {
      var args = arguments;
      var f = args[0];
      for (var i = 1; i < args.length; i++) {
        var r = args[i];
        if (r.width !== f.width && r.height !== f.height) return false;
      }
      return true;
    },
    areEqual:     function () {
      var args = arguments;
      var f = args[0];
      for (var i = 1; i < args.length; i++) {
        var r = args[i];
        if (r.top !== f.top && r.left !== f.left && r.width !== f.width && r.height !== f.height) return false;
      }
      return true;
    },
    toOuter:      function (view, rect) {
      var paddingMetrics = view.paddingMetrics()
          borderMetrics = view.borderMetrics();
          
      if (this.hasTop(rect)) {
        rect.top -= paddingMetrics.top + borderMetrics.top;
      } 

      if (this.hasBottom(rect)) {
        rect.bottom += paddingMetrics.bottom + borderMetrics.bottom
      }

      if (this.hasLeft(rect)) {
        rect.left -= paddingMetrics.left + borderMetrics.left
      }

      if (this.hasRight(rect)) {
        rect.right += paddingMetrics.right + borderMetrics.right;
      }
 
      if (this.hasWidth(rect)) {
        rect.width += paddingMetrics.width + borderMetrics.width;
      }

      if (this.hasHeight(rect)) {
        rect.height += paddingMetrics.height + borderMetrics.height;
      }

      return rect;
    },
    toInner:      function (view, rect) {
      var paddingMetrics = view.paddingMetrics()
          borderMetrics = view.borderMetrics();
          
      if (this.hasTop(rect)) {
        rect.top += paddingMetrics.top + borderMetrics.top;
      } 

      if (this.hasBottom(rect)) {
        rect.bottom -= paddingMetrics.bottom + borderMetrics.bottom
      }

      if (this.hasLeft(rect)) {
        rect.left += paddingMetrics.left + borderMetrics.left
      }

      if (this.hasRight(rect)) {
        rect.right -= paddingMetrics.right + borderMetrics.right;
      }

      if (this.hasWidth(rect)) {
        rect.width -= paddingMetrics.width + borderMetrics.width;
      }

      if (this.hasHeight(rect)) {
        rect.height -= paddingMetrics.height + borderMetrics.height;
      }

      return rect;
    }
  }
  
  ['Top', 'Right', 'Bottom', 'Left', 'Width', 'Height'].forEach(function (e) {
    var lce = e.toLowerCase();
    Superview.Rect['has'+e] = function (rect) {
      return rect && (typeof rect[lce] === 'number') && rect[lce] !== NaN;
    }
  })
})();