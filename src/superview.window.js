Superview.Window = (function () {
  
  var Superview.Window = new Superview(),
      $window = z.window(),
      body = z.body().addClass('superview-window').css({
        margin: 0,
        padding: 0,
        width: '100%',
        height: '100%'
      });
  
  Superview.Window.z().appendTo(body);
  
  override(Superview.Window, {
    setParentView: function (base) {
      throw new Error('cannot set the parent of the window');
    },
    remove: function (base) {
      throw new Error('cannot remove the window');
    },
  );
  
  var w = z.window();
  
  function fitToWindow () {
    z.body.width(w.width());
    z.body.height(z.height());
    Superview.Window.outerResize({
      width: w.width(),
      height: w.height()
    });
  }
  
  fitToWindow()
  w.resize(fitToWindow);
  
  return Superview.Window; 
})();