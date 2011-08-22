Superview.Window = (function () {
  
  var Window = new Superview(),
      $window = z.window(),
      body = z.body();
      
  function fitToWindow () {
    body.width($window.width());
    body.height($window.height());
    Window.outerResize({
      width: $window.width(),
      height: $window.height()
    });
  }
  
  override(Window, {
    setParentView: function (base) {
      throw new Error('cannot set the parent of the window');
    },
    remove: function (base) {
      throw new Error('cannot remove the window');
    }
  });
  
  extend(Window).with({
    install: function () {
      body.addClass('superview-window').css({
        margin: 0,
        padding: 0,
        width: '100%',
        height: '100%'
      });
      
      Window.z().appendTo(body);
      
      fitToWindow();
      $window.resize(fitToWindow);
    }
  });
  
  return Window; 
})();