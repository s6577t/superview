Superview.Page = (function () {
  
  var Page = function () {
    Object.extend(this).mixin(Superview);
  };
  
  Page.prototype = {
    initialize: function () {
      Superview.Window.install();
      this.$().addClass('page');
      this.addTo(Superview.Window);
      this.render();
      this.parent().initialize();
      return this;
    },
    fitWindow: function () {
      return this.anchorTo(Superview.Window, {
        width: true,
        height: true
      });
    },
  };
  
  return Page;
})();


