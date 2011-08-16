Superview.Window = (function () {
  
  var Superview.Window = new Superview();
  
  override(Superview.Window, {
    setParentView :function (base) {
      throw new Error('cannot set the parent of the window');
    },
    remove: function (base) {
      throw new Error('cannot remove the window');
    }
  );
  
  var w = z.window();
  
  w.resize(function () {
    Superview.Window.outerResize({
      width: z.width(),
      height: z.height()
    });    
  });
  
  return Superview.Window; 
})();