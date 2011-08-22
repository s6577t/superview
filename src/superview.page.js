Superview.Page = (function () {
  
  var Page = function () {
    extend(this).mixin(Superview);
    Superview.Window.install();
  };
  
  Page.prototype = {
    fitWindow: function () {
      this.bindTo(Superview.Window, {
        width: true,
        height: true
      });
    }
  };
  
  return Page;
})();

