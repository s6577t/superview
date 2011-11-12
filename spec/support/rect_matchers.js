beforeEach(function () {
  this.addMatchers({
    toEqualRect: function (rect) {
      var self = this;
      if (!self.actual || !rect) return false;
      
      var equal = true;
      
      ['top', 'right', 'bottom', 'left', 'width', 'height'].forEach(function (member) {
        if (self.actual[member] !== rect[member]) equal = false;
      });
      
      return equal;
    }
  });
})