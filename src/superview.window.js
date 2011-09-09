Superview.Window = (function () {
  
  var Window = new Superview().render();

  function fitToWindow () {
    var w = z.window(),
        body = z.body();
    
    body.width(w.width());
    body.height(w.height());
    Window.outerResize({
      width: w.width(),
      height: w.height()
    });
  }
  
  override(Window).withObject({
    addTo: function (base) {
      throw new Error('cannot set the parent of the window');
    },
    remove: function (base) {
      throw new Error('cannot remove the window');
    }
  });
  
  extend(Window).withObject({
    install: function () {
      var body = z.body(),
          w = z.window();
      
      body.addClass('superview').css({
        margin: 0,
        padding: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      });
      
      Window.z().addClass('window').appendTo(body);
      
      fitToWindow();
      w.resize(fitToWindow);
    },
    // only use this for testing
    _uninstall: function () {
      z.body().removeClass('superview').css({
        margin: 0,
        padding: 0,
        width: '100%',
        height: '100%',
        overflow: 'scroll'
      });
      Window.z().detach();
      z.window().unbind('resize', fitToWindow);
    }
  });
  
  return Window; 
})();