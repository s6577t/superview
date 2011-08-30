Superview.Page = (function () {
  
  var Page = function () {
    extend(this).mixin(Superview);
  };
  
  Page.prototype = {
    initialize: function () {
      Superview.Window.initialize();
      return this;
    },
    render: function () {
      Superview.Window.install();
      this.z().addClass('page');
      Superview.Window.add(this);
      return this;
    },
    fitWindow: function () {
      return this.bindTo(Superview.Window, {
        width: true,
        height: true
      });
    },
  };
  
  return Page;
})();


