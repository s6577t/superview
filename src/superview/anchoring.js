Superview.Anchoring = {
  getUpdatedDimension: function (dimension, currentValue, anchoring, view) {
    var anchor = anchoring[dimension];
    var result, error = false;

    switch (typeof anchor) {
      case 'undefined':
        result = currentValue;
        break;
      case 'boolean':
        if (anchor) {
          result = anchoring.otherView.size()[dimension];
        } else {
          result = currentValue;
        }
        break;
      case 'number':
        if (!isNaN(anchor) && anchor !== Infinity) {
          result = anchoring.otherView.size()[dimension] * anchor;
        } else {
          error = true;
        }
        break;
      case 'string':
        var anchorOffset = parseInt(anchor);
        if (!isNaN(anchorOffset) && anchorOffset !== Infinity) {
          result = anchoring.otherView.size()[dimension] + anchorOffset;
        } else {
          error = true;
        }
        break;
      case 'function':
        result = anchor(anchoring.otherView, view);
        if ((typeof result !== 'number') || result === Infinity || isNaN(result)) {
          error = true;
        }
        break;
      default:
        error = true;
    }

    if (error) {
      throw new Error("Invalid anchoring for " + dimension + " (result = " + result + "): " + anchor);
    }

    return result;
  }
  , resizeHandler: function (view) {
    var self = this;

    return function (resizedView) {
      var anchoring = view._anchoring;
      var size = view.size();
      
      size.width  = self.getUpdatedDimension('width', size.width, anchoring, view);
      size.height = self.getUpdatedDimension('height', size.height, anchoring, view)

      view.resize(size);
    }
  }
}
