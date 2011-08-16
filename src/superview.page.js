Superview.Page = (function () {
  
  var Superview.Page = function () {
    extend(this).mixin(Superview);
    z.window().resize()
  };
  
  Superview.Page.prototype = {
    render: function () {
      this.z().id('page');
      
      
      
    },
    render: override(Superview.prototype.render, function (base) {
      
    }),
    
  };
  
  return Superview.Page;
})();

