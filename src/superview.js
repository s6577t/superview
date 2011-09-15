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
    
    this.onResized().throttle(10);
    this.onMoved().throttle(10);
    
    extend(this).withObject({
      hasViewMixin: true,
      _controller: null,
      _parent: null,
      _anchoring: null,
      _subviews: {},
      _restrictions: {},
      _rect: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: 0,
        height: 0
      },
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
    $: function () { 
      return this._zElem; 
    },
    /*
      View tree members
    */
    add: function () {
      var subviewsToAdd = $.isArray(arguments[0]) ? arguments[0] : Array.toArray(arguments);
      var self = this;
      subviewsToAdd.forEach(function (view) {
        self.$().append(view.elem());
        self._subviews[view.vid()] = view;
        view._parent = self;
        // emit an event for listeners
        self.onSubviewAdded().emit(view, self);
        view.onAdded().emit(view, self);
      });
      return this;
    },
    // pass null to set as root view
    addTo: function (parent) {
      if (!parent || this._parent) return this.remove();
      parent.add(this);
      return this;
    },
    parent: function () {
      return this._parent;
    },
    ancestors: function () {
      var ancestors = [];
      var current = this.parent();
      while (current) {
        ancestors.push(current);
        current = current.parent()
      }
      return ancestors;
    },

    isRoot: function () { 
      return !this.parent(); 
    },
    root: function () {
      var v = this;
      while (!v.isRoot()) {
        v = v.parent();
      }
      return v;
    },
    // () to remove from parent, an array and any number of arguments to remove each of them
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
      
      this.$().remove();
      
      var parent = this._parent;
      
      this._parent = null;
      this.onRemoved().emit(this, parent || null);
      
      if (parent) {
        delete parent._subviews[this.vid()];
        parent.onSubviewRemoved().emit(this, parent);
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
      var z = this.$();
      var m = {
        top:    parseFloat(z.css('borderTopWidth'), 10) || 0 ,
        right:  parseFloat(z.css('borderRightWidth'), 10) || 0,
        bottom: parseFloat(z.css('borderBottomWidth'), 10) || 0,
        left:   parseFloat(z.css('borderLeftWidth'), 10) || 0
      }
      
      m.width = m.right + m.left;
      m.height = m.top + m.bottom;
      
      return m;
    },
    paddingMetrics: function () {
      var self = this;
      var z = this.$();
      
      var m = {
        top:    parseFloat(z.css('paddingTop'), 10) || 0 ,
        right:  parseFloat(z.css('paddingRight'), 10) || 0,
        bottom: parseFloat(z.css('paddingBottom'), 10) || 0,
        left:   parseFloat(z.css('paddingLeft'), 10) || 0
      }
      
      m.width = m.right + m.left;
      m.height = m.top + m.bottom;
      
      return m;
    },

    resize: function (s, restrictionsCallback) {
      var resized = false,
          limited = false,
          thi$ = this.$(),
          rect = this.rect(),
          restrictions = this._restrictions;
      
      if (Superview.Rect.hasWidth(s)) {
        
        if (restrictions && restrictions.minimum && Superview.Rect.hasWidth(restrictions.minimum) && restrictions.minimum.width > s.width) {
          limited = true;
          s.width = restrictions.minimum.width;
        }
        
        if (restrictions && restrictions.maximum && Superview.Rect.hasWidth(restrictions.maximum) && restrictions.maximum.width < s.width) {
          limited = true;
          s.width = restrictions.maximum.width;
        }

        if (s.width != rect.width) {
          resized = true;
          rect.width = s.width;
          thi$.css('width', rect.width);
        }
      }
      
      if (Superview.Rect.hasHeight(s)) {
        
        if (restrictions && restrictions.minimum && Superview.Rect.hasHeight(restrictions.minimum) && restrictions.minimum.height > s.height) {
          limited = true;
          s.height = restrictions.minimum.height;
        }
        
        if (restrictions && restrictions.maximum && Superview.Rect.hasHeight(restrictions.maximum) && restrictions.maximum.height < s.height) {
          limited = true;
          s.height = restrictions.maximum.height;
        }
        
        if (s.height != rect.height) {
          resized = true;
          rect.height = s.height;
          thi$.css('height', rect.height);
        }
      }
      
      if (resized) {
        this.onResized().emit(this, this.rect(), this.outerRect());
      }
      
      if (limited && restrictionsCallback) {
        restrictionsCallback.call(this);
      }
      
      return this;
    },
    outerResize: function (s, restrictionsCallback) {
      var z = this.$();
      
      if (Superview.Rect.hasWidth(s)) {
        s.width = s.width - (this.paddingMetrics().width + this.borderMetrics().width);
      }
      
      if (Superview.Rect.hasHeight(s)) {
        s.height = s.height - (this.paddingMetrics().height + this.borderMetrics().height);
      }
      
      return this.resize(s, restrictionsCallback);
    },

    restrictTo: function (restrictions) {
      var self = this;
      this._restrictions = restrictions;
      
      var rect = null;
      
      if (restrictions.minimum) {
        
        if (restrictions.maximum) {
          if ((restrictions.minimum.width > restrictions.maximum.width) || (restrictions.minimum.height > restrictions.maximum.height)) {
            throw new Error('minimum bounds must be less that maximum bounds')
          }
        }
        
        var min = restrictions.minimum;
        rect = self.rect();
        
        rect.width = Math.max(min.width, rect.width);
        rect.height = Math.max(min.height, rect.height);
      }

      if (restrictions.maximum) {
        var max = restrictions.maximum;
        rect = rect || self.rect();
        
        rect.width = Math.min(max.width, rect.width);
        rect.height = Math.min(max.height, rect.height);
      }
      
      if (rect) {
        self.resize(rect);
      }

      return this;
    },
    restrictions: function () {
      return this._restrictions;
    },
    outerRestrictTo: function (outerRestrictions) {
      var restrictions = outerRestrictions;
      
      if (restrictions.minimum) {
        restrictions.minimum = Superview.Rect.toOuter(this, restrictions.minimum);
      }
      
      if (restrictions.maximum) {
        restrictions.maximum = Superview.Rect.toOuter(this, restrictions.maximum);
      }
      
      return this.restrictTo(restrictions);
    },
    outerRestrictions: function () {
      var restrictions = this._restrictions;
      
      if (restrictions.minimum) {
        restrictions.minimum = Superview.Rect.toOuter(this, restrictions.minimum);
      }
      
      if (restrictions.maximum) {
        restrictions.maximum = Superview.Rect.toOuter(this, restrictions.maximum);
      }
      
      return restrictions;
    },
    
    moveTo: function (p) {
      
      // TODO: limit bounds
      NotImplemented();
      
      var moved = false;
      var z = this.$();
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
      // translate this call into a repositioning of the inner rectangle
      p = Superview.Rect.toInner(this, p);
      return this.moveTo(p);
    },

    rect: function () {
      return extend({}).withObject(this._rect);
    },
    outerRect: function () {
      return Superview.Rect.toOuter(this, this._rect);
    },

    anchorTo: function (otherView, anchoring) {
      var self = this;
      
      if (self.anchoring()) self.deanchor();
      
      self._anchoring = anchoring;
      extend(anchoring).withObject({
        otherView: otherView,
        anchorToOuterRect: !self.ancestors().contains(otherView),
        anchorOuterRect: true
      });
      
      self._anchoringResizeHandler = function (otherView, otherViewRect, otherViewOuterRect) {
        var anchoring = self._anchoring;
        var anchorToRect = anchoring.anchorToOuterRect ? otherViewOuterRect : otherViewRect;
        var boundRect = anchoring.anchorOuterRect ? self.outerRect() : self.rect();
        var resize = anchoring.anchorOuterRect ? self.outerResize : self.resize;
        
        function handleSize (dimension) {
          switch (typeof anchoring[dimension]) {
            case 'undefined':
              break;
            case 'boolean':
              if (anchoring[dimension]) {
                boundRect[dimension] = anchorToRect[dimension];
              }
              break;
            case 'number':
              boundRect[dimension] = anchorToRect[dimension] * anchoring[dimension];
              break;
            case 'function':
              boundRect[dimension] = anchoring[dimension](otherView, otherViewRect, otherViewOuterRect);
              break;
            case 'string':
              var expr = anchoring[dimension];
              if (expr.match(/^[\+-]\d+$/)) {
                boundRect[dimension] = eval(anchorToRect[dimension]+expr);
                break;
              }
            default:
              throw new Error("Invalid anchoring for "+dimension+": " + anchoring[dimension]);
          }
        }
        
        handleSize('width');
        handleSize('height');
        resize.call(self, boundRect);
      }
      
      self._anchoringMoveHandler = function (otherView, otherViewRect, otherViewOuterRect) {
        var anchoring = self._anchoring;
        var anchorToRect = anchoring.anchorToOuterRect ? otherViewOuterRect : otherViewRect;
        var moveTo = anchoring.anchorOuterRect ? self.outerMoveTo : self.moveTo;
        var boundRect = {};
        
        function handlePosition (position, dimension, opposite) {
          switch (typeof anchoring[position]) {
            case 'undefined':
              break;
            case 'boolean':
              if (anchoring[position]) {
                boundRect[position] = anchorToRect[position];
              }
              break;
            case 'number':
              boundRect[position] = anchorToRect[dimension] * anchoring[position];
              break;
            case 'string':
              // check if it is an offset expression
              var expr = anchoring[position];
              if (expr.match(/^[\+-]\d+$/)) {
                boundRect[position] = eval(anchorToRect[position]+expr);
                break;
              }
              
              // otherwise maybe it is 'top'/'bottom' or 'left'/'right'
              var stringHandled = true;
              switch (anchoring[position]) {
                case position:
                  boundRect[position] = anchorToRect[position];
                  break;
                case opposite:
                  boundRect[position] = anchorToRect[opposite];
                  break;
                default:
                  stringHandled = false;
              }
              if (stringHandled) break;
            case 'function':
              boundRect[position] = anchoring[position](otherView, otherViewRect, otherViewOuterRect);
              break;
            default:
              throw new Error("Invalid anchoring for " + position + ": " + anchoring[position]);
          }
        }
        
        handlePosition('top', 'height', 'bottom');
        handlePosition('bottom', 'height','top');
        handlePosition('left', 'width', 'right');
        handlePosition('right', 'width', 'left');
        
        if (typeof boundRect.top === 'number' && typeof boundRect.bottom === 'number') {
          var halfHeight = (anchoring.anchorOuterRect ? self.outerRect : self.rect).call(self).height / 2;
          boundRect.top = boundRect.top + ((boundRect.bottom - boundRect.top) / 2) - halfHeight;
          delete boundRect.bottom;
        }

        if (typeof boundRect.left === 'number' && typeof boundRect.right === 'number') {
          var halfWidth = (anchoring.anchorOuterRect ? self.outerRect : self.rect).call(self).width / 2;
          boundRect.left = boundRect.left + ((boundRect.right - boundRect.left) / 2) - halfWidth;
          delete boundRect.right;
        }
        
        moveTo.call(self, boundRect);
      };
      
      self._anchoringSelfResizeHandler = function (me, rect, outerRect) {
        self._anchoringMoveHandler(otherView, otherView.rect(), otherView.outerRect());
      }
      
      otherView.onResized(self._anchoringResizeHandler);
      otherView.onResized(self._anchoringMoveHandler);
      self.onResized(self._anchoringSelfResizeHandler);
      
      otherView.onMoved(self._anchoringResizeHandler);
      otherView.onMoved(self._anchoringMoveHandler);
      otherView.onRemoved(function () {
        self.deanchor();
      });
      
      // set the initial state by
      self._anchoringResizeHandler(otherView, otherView.rect(), otherView.outerRect());
      self._anchoringMoveHandler(otherView, otherView.rect(), otherView.outerRect());

      return this;
    },
    anchorToParent: function (anchoring) {
      return this.isRoot() ? this : this.anchorTo(this.parent(), anchoring);
    },
    anchoring: function () {
      return this._anchoring;
    },
    deanchor: function () {
      
      var self = this;
      var anchoring = this.anchoring();
      
      self.onResized().unbind(self._anchoringSelfResizeHandler);
      delete self._anchoringSelfResizeHandler;
      
      if (anchoring) {
        anchoring.otherView.onResized().unbind(self._anchoringMoveHandler);
        anchoring.otherView.onResized().unbind(self._anchoringResizeHandler);
        anchoring.otherView.onMoved().unbind(self._anchoringMoveHandler);
        anchoring.otherView.onMoved().unbind(self._anchoringResizeHandler);
        
        delete self._anchoringResizeHandler;
        delete self._anchoringMoveHandler;
        
        this._anchoring = null;
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
    update: function () {
      return this.populate();
    },

    /*
      deanchor listeners and nullify local variable
      edging when resizable
    */
    draggable: function () {
      
      var self = this, thiz = this.$(), w = z.window();
      
      // for smoother dragging action
      self.onMoved().throttle(5);
      
      var prev = null
      
      function moveHandler (event) {
        var r = self.outerRect();
        var dx = event.pageX - prev.pageX,
            dy = event.pageY - prev.pageY;
        
        self.moveTo({top: r.top + dy, left: r.left + dx});
        prev = event;
      }
      
      thiz.bind('mousedown', function (event) {
        
        prev = event;
                
        w.bind('mousemove', moveHandler);
        w.one('mouseup', function () {
          w.unbind('mousemove', moveHandler);
        });
      })
    }
  }

  Superview.vidSpool = 1;

})(jQuery)