Superview.Window = (function () {
  
  var Window = new Superview().render();

  function fitToWindow () {
    var w = jQuery(window),
        body = jQuery('body');
    
    body.width(w.width());
    body.height(w.height());
    Window.outerResize({
      width: w.width(),
      height: w.height()
    });
  }
  
  Object.override(Window).withObject({
    addTo: function (base) {
      throw new Error('cannot set the parent of the window');
    },
    remove: function (base) {
      throw new Error('cannot remove the window');
    }
  });

  Object.extend(Window).withObject({
    install: function () {
      var body = jQuery('body'),
          w = jQuery(window);
      
      body.addClass('superview').css({
        margin: 0,
        padding: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      });
      
      Window.$().addClass('window').appendTo(body);
      
      fitToWindow();
      w.resize(fitToWindow);
    },
    // only use this for testing
    _uninstall: function () {
      jQuery('body').removeClass('superview').css({
        margin: 0,
        padding: 0,
        width: '100%',
        height: '100%',
        overflow: 'scroll'
      });
      Window.$().detach();
      jQuery('window').unbind('resize', fitToWindow);
    }
  });
  
  return Window; 
})();