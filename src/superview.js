Superview = (function ($) {

  viewIdSpool = 1;

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

    Object.extend(this).withObject({
      _controller: null,
      _parent: null,
      _anchoring: null,
      _subviews: {},
      _restrictions: {
        minimum: {
          width: 0,
          height: 0
        },
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
      _vid: viewIdSpool++,
      _zElem: jQuery('<div>').css({
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
    }
    , getController: function () {
      return this._controller;
    }
    , vid: function() {
      return this._vid;
    }
    /*
    DOM related members
    */
    , elem: function () {
      return this._zElem.elem();
    }
    , $: function () {
      return this._zElem;
    }
    , css: function () {

      var getting = (arguments.length === 1) && (typeof arguments[0] === 'string');
      var thi$ = this.$();

      if (getting) {
        return thi$.css(arguments[0]);
      } else {

        var priorBorderMetrics = this.borderMetrics();

        if (arguments.length === 1) {
          var cssObj = {};
          for (var member in arguments[0]) {
            if (Superview.CssFilter.isAllowed(member)) {
              cssObj[member] = arguments[0][member];
            }
          }
          thi$.css(cssObj);
        } else {
          if (Superview.CssFilter.isAllowed(arguments[0])) {
            thi$.css(arguments[0], arguments[1]);
          }
        }

        var borderMetrics = this.borderMetrics(),

        deltaLeft   = priorBorderMetrics.left - borderMetrics.left;
        deltaTop    = priorBorderMetrics.top - borderMetrics.top;
        deltaWidth  = priorBorderMetrics.width - borderMetrics.width,
        deltaHeight = priorBorderMetrics.height - borderMetrics.height;

        if (deltaLeft ||  deltaTop) {
          this.contentArea().onMoved().emit(this.contentArea());
        }

        if (deltaWidth || deltaHeight) {
          this.contentArea().onResized().emit(this.contentArea());
        }

        this.$().css('width', parseInt(this.$().css('width')) + deltaWidth);
        this.$().css('height', parseInt(this.$().css('height')) + deltaHeight);

        return this;
      }
    }
    /*
    View tree members
    */
    , add: function () {
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
    }
    // pass null to set as root view
    , addTo: function (parent) {
      if (!parent || this._parent) return this.remove();
      parent.add(this);
      return this;
    }
    , parent: function () {
      return this._parent;
    }
    , ancestors: function () {
      var ancestors = [];
      var current = this.parent();
      while (current) {
        ancestors.push(current);
        current = current.parent()
      }
      return ancestors;
    }

    , isRoot: function () {
      return !this.parent();
    }
    , root: function () {
      var v = this;
      while (!v.isRoot()) {
        v = v.parent();
      }
      return v;
    }
    // () to remove from parent, an array and any number of arguments to remove each of them
    , remove: function () {

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
    }
    , removeAll: function () {
      return this.remove(this.subviews());
    }
    , subviews: function (recur) {
      var subs = Object.values(this._subviews);

      if (recur) {
        subs.copy().forEach(function (s) {
          subs = subs.concat(s.subviews(recur));
        })
      }

      return subs;
    }

    , initialize: function () {
      var vs = this.subviews(true);
      vs.unshift(this);
      vs.forEach(function (view) {
        view.bind()
        view.populate()
      });
      return this;
    }
    , render: function () {
      // NOOP default. override me!
      return this
    }
    , bind: function () {
      // NOOP. Override me!
      return this;
    }
    , populate: function () {
      // NOOP. Override me!
      return this;
    }
    , update: function () {
      return this.populate();
    }

    , borderMetrics: function () {
      var self = this;
      var thi$ = this.$();
      var m = {
        top:    parseFloat(thi$.css('borderTopWidth'), 10) || 0 ,
        right:  parseFloat(thi$.css('borderRightWidth'), 10) || 0,
        bottom: parseFloat(thi$.css('borderBottomWidth'), 10) || 0,
        left:   parseFloat(thi$.css('borderLeftWidth'), 10) || 0
      }

      m.width = m.right + m.left;
      m.height = m.top + m.bottom;

      return m;
    }

    , resize: function (newSize, restrictionCallback) {

      newSize = new Superview.Rect(newSize);

      var resized     = false
      , restricted    = false
      , thi$          = this.$()
      , size          = this._size
      , restrictions  = new Superview.Restrictions(this.restrictions())
      , borderMetrics = this.borderMetrics();

      if (newSize.hasWidth()) {

        if (restrictions.minimum.hasWidth() && (newSize.width < restrictions.minimum.width)) {
          newSize.width = restrictions.minimum.width;
          restricted = true;
        }

        if (restrictions.maximum.hasWidth() && (newSize.width > restrictions.maximum.width)) {
          newSize.width = restrictions.maximum.width;
          restricted = true;
        }

        if (newSize.width !== size.width) {
          resized = true;
          size.width = newSize.width;
          thi$.css('width', Math.max(0, size.width - borderMetrics.width));
        }
      }

      if (newSize.hasHeight()) {

        if (restrictions.minimum.hasHeight() && (newSize.height < restrictions.minimum.height)) {
          newSize.height = restrictions.minimum.height;
          restricted = true;
        }

        if (restrictions.maximum.hasHeight() && (newSize.height > restrictions.maximum.height)) {
          newSize.height = restrictions.maximum.height;
          restricted = true;
        }

        if (newSize.height !== size.height) {
          resized = true;
          size.height = newSize.height;
          thi$.css('height', Math.max(0, size.height - borderMetrics.height));
        }
      }

      if (resized) {
        this.onResized().emit(this);
        this.contentArea().onResized().emit(this.contentArea());
      }

      if (restricted && (typeof restrictionCallback === 'function')) {
        restrictionCallback();
      }

      return this;
    }
    , moveTo: function (newPosition, restrictionCallback) {

      newPosition = new Superview.Rect(newPosition);

      var moved = false,
      restricted = false,
      thi$ = this.$(),
      position = this._position,
      size = this.size(),
      restrictions = new Superview.Restrictions(this.restrictions());

      if (newPosition.hasRight() && !newPosition.hasLeft()) {
        newPosition.left = newPosition.right - size.width;
      }

      if (newPosition.hasBottom() && !newPosition.hasTop()) {
        newPosition.top = newPosition.bottom - size.height;
      }

      if (newPosition.hasLeft()) {

        if (restrictions.minimum.hasLeft() && (newPosition.left < restrictions.minimum.left)) {
          newPosition.left = restrictions.minimum.left;
          restricted = true;
        }

        if (restrictions.maximum.hasLeft() && (newPosition.left > restrictions.maximum.left)) {
          newPosition.left = restrictions.maximum.left;
          restricted = true;
        }

        if (newPosition.left != position.left) {
          moved = true;
          position.left = newPosition.left;
          thi$.css('left', position.left);
        }
      }

      if (newPosition.hasTop()) {

        if (restrictions.minimum.hasTop() && (newPosition.top < restrictions.minimum.top)) {
          newPosition.top = restrictions.minimum.top;
          restricted = true;
        }

        if (restrictions.maximum.hasTop() && (newPosition.top > restrictions.maximum.top)) {
          newPosition.top = restrictions.maximum.top;
          restricted = true;
        }

        if (newPosition.top != position.top) {
          moved = true;
          position.top = newPosition.top;
          thi$.css('top', position.top);
        }
      }

      if (moved) {

        position.right = position.left + size.width;
        position.bottom = position.top + size.height;

        this.onMoved().emit(this);
        this.contentArea().onMoved().emit(this.contentArea());
      }

      if (restricted && (typeof restrictionCallback === 'function')) {
        restrictionCallback();
      }

      return this;
    }

    , restrictTo: function (restrictions) {
      if (restrictions === null) restrictions = {};

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

      if (restrictions.minimum.hasWidth() && (size.width < restrictions.minimum.width)) {
        resize.width = restrictions.minimum.width;
      }

      if (restrictions.maximum.hasWidth() && (size.width > restrictions.maximum.width)) {
        resize.width = restrictions.maximum.width;
      }

      if (restrictions.minimum.hasHeight() && (size.height < restrictions.minimum.height)) {
        resize.height = restrictions.minimum.height;
      }

      if (restrictions.maximum.hasHeight() && (size.height > restrictions.maximum.height)) {
        resize.height = restrictions.maximum.height;
      }

      if (resize.hasWidth() || resize.hasHeight()) {
        self.resize(resize);
      }

      // move if necessery to fit the bounds
      var move = new Superview.Rect;

      if (restrictions.minimum.hasLeft() && (position.left < restrictions.minimum.left)) {
        move.left = restrictions.minimum.left;
      }

      if (restrictions.maximum.hasLeft() && (position.left > restrictions.maximum.left)) {
        move.left = restrictions.maximum.left;
      }

      if (restrictions.minimum.hasTop() && (position.top < restrictions.minimum.top)) {
        move.top = restrictions.minimum.top;
      }

      if (restrictions.maximum.hasTop() && (position.top > restrictions.maximum.top)) {
        move.top = restrictions.maximum.top;
      }

      if (move.hasTop() || move.hasLeft() || move.hasRight() || move.hasBottom()) {
        self.moveTo(move);
      }

      this._restrictions = restrictions.flatten();
      return this;
    }
    , restrictions: function () {
      return jQuery.extend(true, {}, this._restrictions);
    }

    , size: function () {
      return Object.shallowCopy(this._size);
    }
    , position: function () {
      return Object.shallowCopy(this._position);
    }

    , contentArea: function () {
      return this._contentArea = this._contentArea || (function (superview) {
        var contentArea = {

          size: function () {
            var boundaryBoxSize = superview.size();
            var borderMetrics = superview.borderMetrics();

            boundaryBoxSize.width -= borderMetrics.width;
            boundaryBoxSize.height -= borderMetrics.height;

            return boundaryBoxSize;
          }
          , resize: function (newSize, restrictionCallback) {
            newSize = new Superview.Rect(newSize);
            newSize.addBorder(superview.borderMetrics());

            return superview.resize(newSize.flatten(), restrictionCallback);
          }
          , position: function () {
            var boundaryBoxPosition = superview.position();
            var borderMetrics = superview.borderMetrics();

            boundaryBoxPosition.top += borderMetrics.top;
            boundaryBoxPosition.bottom -= borderMetrics.bottom;
            boundaryBoxPosition.left += borderMetrics.left;
            boundaryBoxPosition.right -= borderMetrics.right;

            return boundaryBoxPosition;
          }
          , moveTo: function (newPosition, restrictionCallback) {
            newPosition = new Superview.Rect(newPosition);
            newPosition.addBorder(superview.borderMetrics());
            return superview.moveTo(newPosition.flatten(), restrictionCallback);
          }
          , restrictTo: function (restrictions) {
            restrictions = new Superview.Restrictions(restrictions);
            var borderMetrics = superview.borderMetrics();   
            restrictions.minimum.addBorder(borderMetrics);
            restrictions.maximum.addBorder(borderMetrics);
            return superview.restrictions(restrictions.flatten());
          }
          , restrictions: function () {
            var restrictions = new Superview.Restrictions(superview.restrictions());
            var borderMetrics = superview.borderMetrics();   
            restrictions.minimum.removeBorder(borderMetrics);
            restrictions.maximum.removeBorder(borderMetrics);
            return restrictions.flatten();
          }
        };

        eventify(contentArea).define(
          'onMoved', // (source contentArea)
          'onResized' // (source contentArea)
        );

        return contentArea;
      })(this);
    }

    , anchorTo: function (otherView, anchoring) {
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
    }
    , anchorToParent: function (anchoring) {
      return this.isRoot() ? this : this.anchorTo(this.parent(), anchoring);
    }
    , anchoring: function () {
      return this._anchoring;
    }
    , deanchor: function () {

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
    }

    , draggable: function () {

      var self = this, thi$ = this.$(), w = jQuery(window);

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

      thi$.bind('mousedown', function (event) {

        prev = event;

        w.bind('mousemove', moveHandler);
        w.one('mouseup', function () {
          w.unbind('mousemove', moveHandler);
        });
      })
    }
  }

  return Superview;
})(jQuery)