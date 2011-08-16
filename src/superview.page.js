Superview.Page = (function () {
  
  var Superview.Page = function () {
    extend(this).mixin(Superview);
  };
  
  Superview.Page.prototype = {
    fitWindow: function () {
      this.bindTo(Superview.Window, {
        width: true,
        height: true
      });
    }
  };
  
  return Superview.Page;
})();

