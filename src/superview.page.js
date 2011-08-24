Superview.Page = (function () {
  
  var Page = function () {
    extend(this).mixin(Superview);
    Superview.Window.install();
    this.z().addClass('page');
    Superview.Window.add(this);
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

