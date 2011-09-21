(function ($) {
  
  Superview = function () {
      
    eventify(this).define( 
      'onResized', // (sourceView)
      'onMoved', // (sourceView)
      'onSubviewAdded', // (child, parent)
      'onSubviewRemoved', // (child, parent)
      'onAdded', // (child, parent)
      'onRemoved' // (child, parent)
    );
    
    this.onResized().throttle(10);
    this.onMoved().throttle(10);
    
    extend(this).withObject({
      _controller: null,
      _parent: null,
      _anchoring: null,
      _subviews: {},
      _restrictions: {
        minimum: {},
        maximum: {}
      },
      _size: {
        width: 0,
        height: 0
      },
      _position: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
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

    resize: function (newSize, options) {
      options = defaultsFor(options, {
        //restrictionsCallback: function () {}
      });
      
      newSize = new Superview.Rect(newSize);
      
      var resized = false,
          limited = false,
          thi$ = this.$(),
          size = this._size,
          borderMetrics = this.borderMetrics();
      
      if (newSize.hasWidth()) {
        
       if (newSize.width !== size.width) {
          resized = true;
          size.width = newSize.width;
          thi$.css('width', Math.max(0, size.width - borderMetrics.width));
        }
      }
      
      if (newSize.hasHeight()) {
        
       if (newSize.height !== size.height) {
          resized = true;
          size.height = newSize.height;
          thi$.css('height', Math.max(0, size.height - borderMetrics.height));
        }
      }
      
      if (resized) {
        this.onResized().emit(this);
      }
      
      return this;
    },

    restrictTo: function (restrictions) {
      var self = this;
      var size = this.size();
      var position = this.position();
      restrictions = new Superview.Restrictions(restrictions);
      
      // preprocessing to normalize the input
      ['minimum', 'maximum'].forEach(function (limit) {
        limit = restrictions[limit];

        if (limit.hasTop()) {
          limit.bottom = limit.top + size.height;
        }

        if (!limit.hasTop() && limit.hasBottom()) {
          limit.top = limit.bottom - size.height;
        }

        if (limit.hasLeft()) {
          limit.right = limit.left + size.width;
        }

        if (!limit.hasLeft() && limit.hasRight()) {
          limit.left = limit.right - size.width;
        }

        // fix the min/max width/height to ZERO
        ['width', 'height'].forEach(function (dimension) {
          if (limit[dimension]) {
            limit[dimension] = Math.max(0, limit[dimension]);
          }
        });
      });

      ['top', 'left', 'width', 'height'].forEach(function (component) {
        if (restrictions.minimum.has(component) && 
            restrictions.maximum.has(component) &&
            restrictions.minimum[component] > restrictions.maximum[component]) {
          throw new Error("Cannot set the minimum {component}={min} greater than the maximum {component}={max}".supplant({
            component: component,
            min: restrictions.minimum[component],
            max: restrictions.maximum[component]
          }))
        }
      });

      // resize if necessary to fit the bounds
      var resize = new Superview.Rect;

      if (restrictions.minimum.hasWidth() && (size.width > restrictions.minimum.width)) {
        resize.width = restrictions.minimum.width;
      }

      if (restrictions.maximum.hasWidth() && (size.width < restrictions.maximum.width)) {
        resize.width = restrictions.maximum.width;
      }

      if (restrictions.minimum.hasHeight() && (size.height > restrictions.minimum.height)) {
        resize.height = restrictions.minimum.height;
      }

      if (restrictions.maximum.hasHeight() && (size.height < restrictions.maximum.height)) {
        resize.height = restrictions.maximum.height;
      }

      if (resize.hasWidth() || resize.hasHeight()) {
        self.resize(resize);
      }

      // move if necessery to fit the bounds
      var move = new Superview.Rect;

      if (restrictions.minimum.hasLeft() && (position.left > restrictions.minimum.left)) {
        move.left = restrictions.minimum.left;
      }

      if (restrictions.maximum.hasLeft() && (position.left < restrictions.maximum.left)) {
        move.left = restrictions.maximum.left;
      }

      if (restrictions.minimum.hasTop() && (position.top > restrictions.minimum.top)) {
        move.top = restrictions.minimum.top;
      }

      if (restrictions.maximum.hasTop() && (position.top < restrictions.maximum.top)) {
        move.top = restrictions.maximum.top;
      }

      if (move.hasTop() || move.hasLeft() || move.hasRight() || move.hasBottom()) {
        self.moveTo(move);
      }

      this._restrictions = restrictions.flatten();
      return this;
    },
    restrictions: function () {
      return this._restrictions;
    },
    
    moveTo: function (newPosition) {
      
      newPosition = new Superview.Rect(newPosition);

      var moved = false;
      var thi$ = this.$();
      var position = this._position;
      var size = this.size();

      if (newPosition.hasRight() && !newPosition.hasLeft()) {
        newPosition.left = newPosition.right - size.width;
      }
      
      if (newPosition.hasBottom() && !newPosition.hasTop()) {
        newPosition.top = newPosition.bottom - size.height;
      }

      if (newPosition.hasLeft() && newPosition.left != position.left) {
        moved = true;
        position.left = newPosition.left;
        thi$.css('left', position.left);
      }

      if (newPosition.hasTop() && newPosition.top != position.top) {
        moved = true;
        position.top = newPosition.top;
        thi$.css('top', position.top);
      }

      if (moved) {

        position.right = position.left + size.width;
        position.bottom = position.top + size.height;

        this.onMoved().emit(this);
      }

      return this;
    },

    size: function () {
      return this._size;
    },
    position: function () {
      return this._position;
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