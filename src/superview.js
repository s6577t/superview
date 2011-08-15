(function ($) {
  
  Superview = function () {
      
    Events(this).define( 
      'onResized', // (source_view, rect, outerRect)
      'onMoved', // (source_view, rect, outerRect)
      'onSubviewAdded', // (child, parent)
      'onSubviewRemoved', // (child, parent)
      'onParentViewSet', // (child, parent)
      'onRemoved' // (child, parent)
    );
    
    extend(this).with({
      hasViewMixin: true,
      _controller: null,
      _parentView: null,
      _binding: null,
      _subviews: {},
      _uid: Superview.uidSpool++,
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
    uid: function() { 
      return this._uid; 
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
    addSubview: function (view) {
     this.z().append(view.elem());
     view.setParentView(this);
     this._subviews[view.uid()] = view;
     
     // emit an event for listeners
     this.onSubviewAdded().emit(view, this);
     
     return this;
    },
    addSubviews: function () {
      var subviewsToAdd = $.isArray(arguments[0]) ? arguments[0] : Array.toArray(arguments);
      var self = this;
      subviewsToAdd.forEach(function (subview) {
        self.addSubview(subview);
      });
      
      return this;
    },
    isRootView: function () { 
      return !this.getParentView(); 
    },
    getRootView: function () {
      var v = this;
      while (!v.isRootView()) {
        v = v.getParentView();
      }
      return v;
    },
    // pass null to set as root view
    setParentView: function (parentView) {
      if (!parentView) return this.remove();
      if (this._parentView) throw 'parent view already set';
      parentView._subviews[this.uid()] = this;
      this._parentView = parentView;
      this.onParentViewSet().emit(this, parentView);
      return this;
    },
    getParentView: function () {
      return this._parentView;
    },
    // removeSubViews(list, of, subviews) OR removeSubViews(ONE_ARRAY)
    removeSubviews: function () {
      
      var subviewsToRemove = $.isArray(arguments[0]) ? arguments[0] : Array.toArray(arguments);
      var self = this;
      subviewsToRemove.forEach(function (subview) {
        self.removeSubview(subview);
      });
      
      return this;
    },
    removeSubview: function (subview) {
      subview.remove();
      return this;
    },
    remove: function () {
      this.z().remove();
      
      var parentView = this._parentView;
      
      this._parentView = null;
      this.onRemoved().emit(this, parentView || null);
      
      if (parentView) {
        delete parentView._subviews[this.uid()];
        parentView.onSubviewRemoved().emit(this, parentView);
      }
      
      this.removeAllSubviews();
      return this;
    },
    removeAllSubviews: function () {
      return this.removeSubviews(this.subviews());
    },
    subviews: function () {
      return Object.values(this._subviews);
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
      
      return this;
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
    }
  }
  
  Superview.uidSpool = 1;
  
})(jQuery)