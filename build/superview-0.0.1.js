;
var KeyCodes = {
  Escape: 27,
  Return: 13
}
;
;
(function ($) {
  
  Superview = function () {
      
    eventify(this).define( 
      'onResized', // (source_view, rect, outerRect)
      'onMoved', // (source_view, rect, outerRect)
      'onSubviewAdded', // (child, parent)
      'onSubviewRemoved', // (child, parent)
      'onAdded', // (child, parent)
      'onRemoved' // (child, parent)
    );
    
    this.onResized().throttle(100);
    this.onMoved().throttle(100);
    
    extend(this).with({
      hasViewMixin: true,
      _controller: null,
      _parentView: null,
      _binding: null,
      _subviews: {},
      _vid: Superview.vidSpool++,
      _zElem: z.div().css({
        overflow: 'hidden',
        display: 'inline-block',
        position: 'absolute',
        left: 0,
        top: 0
      })
    });    
  }
  
  Superview.prototype = {
    setController: function (c) {
      this._controller = c;
      return this;
    },
    getController: function () {
      return this._controller;
    },
    vid: function() { 
      return this._vid; 
    },
    /*
      DOM related members
    */
    elem: function () { 
      return this._zElem.elem(); 
    },
    z: function () { 
      return this._zElem; 
    },
    /*
      View tree members
    */
    add: function () {
      var subviewsToAdd = $.isArray(arguments[0]) ? arguments[0] : Array.toArray(arguments);
      var self = this;
      subviewsToAdd.forEach(function (view) {
        self.z().append(view.elem());
        self._subviews[view.vid()] = view;
        view._parentView = self;
        // emit an event for listeners
        self.onSubviewAdded().emit(view, self);
        view.onAdded().emit(view, self);
      });
      return this;
    },
    // pass null to set as root view
    addTo: function (parentView) {
      if (!parentView || this._parentView) return this.remove();
      parentView.add(this);
      return this;
    },
    parentView: function () {
      return this._parentView;
    },
    
    isRootView: function () { 
      return !this.parentView(); 
    },
    rootView: function () {
      var v = this;
      while (!v.isRootView()) {
        v = v.parentView();
      }
      return v;
    },
    // () to remove from parent, an array and any number of arguments ro remove each of them
    remove: function () {
      
      var self = this;
      
      var subviewsToRemove = null, arrayPassed = false;
      if (arguments.length > 0) {
        if (jQuery.isArray(arguments[0])) {
          subviewsToRemove = arguments[0];
          arrayPassed = true;
        } else {
          subviewsToRemove = Array.toArray(arguments);
        }
      }

      if (arrayPassed || (subviewsToRemove && subviewsToRemove.length > 0)) {
        subviewsToRemove.forEach(function (subview) {
          subview.remove();
        });
        return self;
      }
      
      this.z().remove();
      
      var parentView = this._parentView;
      
      this._parentView = null;
      this.onRemoved().emit(this, parentView || null);
      
      if (parentView) {
        delete parentView._subviews[this.vid()];
        parentView.onSubviewRemoved().emit(this, parentView);
      }
      
      this.removeAll();
      
      deventify(this);
      return this;
    },
    removeAll: function () {
      return this.remove(this.subviews());
    },
    subviews: function (recur) {
      var subs = Object.values(this._subviews);
      
      if (recur) {
        subs.copy().forEach(function (s) {
          subs = subs.concat(s.subviews(recur));
        })
      }
      
      return subs;
    },
    // rectangle related functionality
    borderMetrics: function () {
      var self = this;
      var z = this.z();
      var m = {
        top:    parseFloat(z.css('borderTopWidth')) || 0 ,
        right:  parseFloat(z.css('borderRightWidth')) || 0,
        bottom: parseFloat(z.css('borderBottomWidth')) || 0,
        left:   parseFloat(z.css('borderLeftWidth')) || 0
      }
      
      m.width = m.right + m.left;
      m.height = m.top + m.bottom;
      
      return m;
    },
    paddingMetrics: function () {
      var self = this;
      var z = this.z();
      
      var m = {
        top:    parseFloat(z.css('paddingTop')) || 0 ,
        right:  parseFloat(z.css('paddingRight')) || 0,
        bottom: parseFloat(z.css('paddingBottom')) || 0,
        left:   parseFloat(z.css('paddingLeft')) || 0
      }
      
      m.width = m.right + m.left;
      m.height = m.top + m.bottom;
      
      return m;
    },
    
    resize: function (s) {
      var resized = false;
      var z = this.z();
      var r = this.rect();
      
      if (Superview.Rect.hasWidth(s) && s.width != r.width) {
        resized = true;
        r.width = s.width;
        z.css('width', r.width);
      }
      
      if (Superview.Rect.hasHeight(s) && s.height != r.height) {
        resized = true;
        r.height = s.height;
        z.css('height', r.height);
      }
      
      if (resized) {
        this.onResized().emit(this, this.rect(), this.outerRect());
      }
      
      return this;
    },
    outerResize: function (s) {
      var z = this.z();
      
      if (Superview.Rect.hasWidth(s)) {
        s.width = s.width - (this.paddingMetrics().width + this.borderMetrics().width);
      }
      
      if (Superview.Rect.hasHeight(s)) {
        s.height = s.height - (this.paddingMetrics().height + this.borderMetrics().height);
      }
      
      return this.resize(s);
    },
    
    moveTo: function (p) {
      var moved = false;
      var z = this.z();
      var r = this.rect();
      var paddingMetrics = this.paddingMetrics();
      var borderMetrics = this.borderMetrics();
      
      if (!Superview.Rect.hasTop(p) && Superview.Rect.hasBottom(p)) {
        p.top = p.bottom - r.height;
      }
      
      if (!Superview.Rect.hasLeft(p) && Superview.Rect.hasRight(p)) {
        p.left = p.right - r.width;
      }
      
      if (Superview.Rect.hasTop(p) && p.top != r.top) {
        moved = true;
        r.top = p.top - paddingMetrics.top - borderMetrics.top;
        z.css('top', r.top);
      }
      
      if (typeof p.left === 'number' && p.left != r.left) {
        moved = true;
        r.left = p.left - paddingMetrics.left - borderMetrics.left;
        z.css('left', r.left);
      }
      
      if (moved) {
        this.onMoved().emit(this, this.rect(), this.outerRect());
      }
      
      return this;
    },
    outerMoveTo: function (p) {
      var z = this.z();
      var paddingMetrics = this.paddingMetrics();
      var borderMetrics = this.borderMetrics();
      
      // translate this call into a repositioning of the inner rectangle
      
      if (Superview.Rect.hasTop(p)) {
        p.top += paddingMetrics.top + borderMetrics.top;
      } 
      
      if (Superview.Rect.hasBottom(p)) {
        p.bottom -= paddingMetrics.bottom + borderMetrics.bottom
      }
      
      if (Superview.Rect.hasLeft(p)) {
        p.left += paddingMetrics.left + borderMetrics.left
      }
      
      if (Superview.Rect.hasRight(p)) {
        p.right -= paddingMetrics.right + borderMetrics.right;
      }
      
      return this.moveTo(p);
    },
    
    rect: function () {
      var self = this;
      var z = this.z();
      var p = {
        left: parseFloat(z.css('left')),
        top: parseFloat(z.css('top'))
      };
  
      var r = {
        top: p.top + self.paddingMetrics().top + self.borderMetrics().top,
        left: p.left + self.paddingMetrics().left + self.borderMetrics().left,
        width: z.width(),
        height: z.height() 
      };
      
      r.right = r.left + r.width;
      r.bottom = r.top + r.height;
      
      return r;
    },
    outerRect: function () {
      var self = this;
      var z = this.z();
      var p = {
        left: parseFloat(z.css('left')),
        top: parseFloat(z.css('top'))
      };
      
      var r = {
        top: p.top ,
        left: p.left,
        width: z.outerWidth(),
        height: z.outerHeight() 
      };
      
      r.right = r.left + r.width;
      r.bottom = r.top + r.height;
      
      return r;
    },
    
    bindTo: function (otherView, binding) {
      var self = this;
      
      if (self.binding()) self.unbind();
      
      self._binding = binding;
      binding.otherView = otherView;
      
      self._bindingResizeHandler = function (otherView, otherViewRect, otherViewOuterRect) {
        var binding = self._binding;
        var outerRect = self.outerRect();
        
        function handleSize (dimension) {
          switch (typeof binding[dimension]) {
            case 'undefined':
              break;
            case 'boolean':
              if (binding[dimension]) {
                outerRect[dimension] = otherViewRect[dimension];
              }
              break;
            case 'number':
              outerRect[dimension] = otherViewRect[dimension] * binding[dimension];
              break;
            case 'function':
              outerRect[dimension] = binding[dimension](otherView, otherViewRect, otherViewOuterRect);
              break;
            default:
              throw new Error("Invalid binding for "+dimension+": " + binding[dimension]);
          }
        }
        
        handleSize('width');
        handleSize('height');
        self.outerResize(outerRect);
      }
      
      self._bindingMoveHandler = function (otherView, otherViewRect, otherViewOuterRect) {
        var binding = self._binding;
        var newOuterRect = {};
        
        function handlePosition (position, dimension, opposite) {
          switch (typeof binding[position]) {
            case 'undefined':
              break;
            case 'boolean':
              if (binding[position]) {
                newOuterRect[position] = otherViewOuterRect[position];
              }
              break;
            case 'number':
              newOuterRect[position] = otherViewRect[dimension] * binding[position];
              break;
            case 'string':
              var stringHandled = true;
              switch (binding[position]) {
                case position:
                  newOuterRect[position] = otherViewOuterRect[position];
                  break;
                case opposite:
                  newOuterRect[position] = otherViewOuterRect[opposite];
                  break;
                default:
                  stringHandled = false;
              }
              if (stringHandled) break;
            case 'function':
              newOuterRect[position] = binding[position](otherView, otherViewRect, otherViewOuterRect);
              break;
            default:
              throw new Error("Invalid binding for " + position + ": " + binding[position]);
          }
        }
        
        handlePosition('top', 'height', 'bottom');
        handlePosition('bottom', 'height','top');
        handlePosition('left', 'width', 'right');
        handlePosition('right', 'width', 'left');
        
        self.outerMoveTo(newOuterRect);
      };
      
      otherView.onResized(self._bindingResizeHandler);
      otherView.onResized(self._bindingMoveHandler);
      otherView.onMoved(self._bindingResizeHandler);
      otherView.onMoved(self._bindingMoveHandler);
      otherView.onRemoved(function () {
        self.unbind();
      });
      
      return this;
    },
    bindToParent: function (binding) {
      return this.bindTo(this.parentView(), binding);
    },
    binding: function () {
      return this._binding;
    },
    unbind: function () {
      
      var self = this;
      var binding = this.binding();
      
      if (binding) {
        binding.otherView.onResized().unbind(self._bindingMoveHandler);
        binding.otherView.onResized().unbind(self._bindingResizeHandler);
        binding.otherView.onMoved().unbind(self._bindingMoveHandler);
        binding.otherView.onMoved().unbind(self._bindingResizeHandler);
        
        this._binding = null;
      }
      
      return this;
    },
    
    initialize: function () {
      var vs = this.subviews(true);
      vs.unshift(this);
      vs.forEach(function (view) {
        view.bind()
        view.populate()
      });
      this.onMoved().emit(this, this.rect(), this.outerRect());
      this.onResized().emit(this, this.rect(), this.outerRect());
      return this;
    },
    render: function () {
      // NOOP default. override me!
      return this
    },
    bind: function () {
      // NOOP. Override me!
      return this;
    },
    populate: function () {
      // NOOP. Override me!
      return this;
    },
    repopulate: function () {
      return this.populate();
    }
  }
  
  Superview.vidSpool = 1;
  
})(jQuery)
;
;
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


;
;
(function () {
  
  Superview.Rect = {
    hasHeight: function (r) {
      return r && (typeof r.height === 'number');
    },
    hasWidth: function (r) {
      return r && (typeof r.width === 'number');
    },
    hasTop: function (r) {
      return r && (typeof r.top === 'number');
    },
    hasLeft: function (r) {
      return r && (typeof r.left === 'number');
    },
    hasBottom: function (r) {
      return r && (typeof r.bottom === 'number');
    },
    hasRight: function (r) {
      return r && (typeof r.right === 'number');
    },
    samePosition: function () {
      var args = arguments;
      var f = args[0];
      for (var i = 1; i < args.length; i++) {
        var r = args[i];
        if (r.top !== f.top && r.left !== f.left) return false;
      }
      return true;
    },
    sameSize: function () {
      var args = arguments;
      var f = args[0];
      for (var i = 1; i < args.length; i++) {
        var r = args[i];
        if (r.width !== f.width && r.height !== f.height) return false;
      }
      return true;
    },
    areEqual: function () {
      var args = arguments;
      var f = args[0];
      for (var i = 1; i < args.length; i++) {
        var r = args[i];
        if (r.top !== f.top && r.left !== f.left && r.width !== f.width && r.height !== f.height) return false;
      }
      return true;
    }   
  }

})();
;
;
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
  
  override(Window).with({
    addTo: function (base) {
      throw new Error('cannot set the parent of the window');
    },
    remove: function (base) {
      throw new Error('cannot remove the window');
    }
  });
  
  extend(Window).with({
    install: function () {
      var body = z.body(),
          w = z.window();
      
      body.addClass('superview').css({
        margin: 0,
        padding: 0,
        width: '100%',
        height: '100%'
      });
      
      Window.z().addClass('window').appendTo(body);
      
      fitToWindow();
      w.resize(fitToWindow);
    },
    uninstall: function () {
      z.body().removeClass('superview').css({
        margin: null,
        padding: null,
        width: null,
        height: null
      });
      Window.z().detach();
      z.window().unbind('resize', fitToWindow);
    }
  });
  
  return Window; 
})();
;
