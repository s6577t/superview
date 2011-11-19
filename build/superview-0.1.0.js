/*Copyright (C) 2011 by sjltaylor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicence, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/;Superview = (function ($) {

  viewIdSpool = 1;

  function superviewElement () {
    var e = document.createElement('div');

    e.id             = 'superview_' + viewIdSpool;
    e.style.overflow = 'hidden';
    e.style.display  = 'block';
    e.style.position = 'absolute';
    e.style.left     = 0;
    e.style.top      = 0;

    return e;
  }

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
      _superviewElement: superviewElement()
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
      return this._superviewElement;
    }
    , $: function () {
      return jQuery(this._superviewElement);
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

          var size = this.size();
          size.width = Math.max(size.width, borderMetrics.width);
          size.height = Math.max(size.height, borderMetrics.height);

          if (this._size.width !== size.width || this._size.height !== size.height) {
            this.resize(size);
          } else {
            this.contentArea().onResized().emit(this.contentArea());
          }
        }

        this.$().css('width', parseInt(this.$().css('width'), 10) + deltaWidth);
        this.$().css('height', parseInt(this.$().css('height'), 10) + deltaHeight);

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
      var e = this.elem();
      var m = {
        top:    parseInt(e.style.borderTopWidth, 10) || 0 ,
        right:  parseInt(e.style.borderRightWidth, 10) || 0,
        bottom: parseInt(e.style.borderBottomWidth, 10) || 0,
        left:   parseInt(e.style.borderLeftWidth, 10) || 0
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

        newSize.width = Math.max(borderMetrics.width, newSize.width);

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

        newSize.height = Math.max(borderMetrics.height, newSize.height)

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

        this.onMoved().emit(this);
        this.contentArea().onMoved().emit(this.contentArea());
      }

      if (restricted && (typeof restrictionCallback === 'function')) {
        restrictionCallback();
      }

      return this;
    }

    , restrictTo: function (restrictions) {

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
      var position = Object.shallowCopy(this._position);
      position.right = position.left + this._size.width;
      position.bottom = position.top + this._size.height;
      return position;
    }

    , contentArea: function () {
      return this._contentArea = this._contentArea || (function (superview) {
        var contentArea = {
          boundaryBox: function () {
            return superview;
          }
          , size: function () {
            var boundaryBoxSize = new Superview.Rect(superview.size());
            return boundaryBoxSize.removeBorder(superview.borderMetrics()).flatten();
          }
          , resize: function (newSize, restrictionCallback) {

            newSize = new Superview.Rect(newSize);
            newSize.addBorder(superview.borderMetrics());

            superview.resize(newSize.flatten(), restrictionCallback);

            return this;
          }
          , position: function () {
            var boundaryBoxPosition = new Superview.Rect(superview.position());
            return boundaryBoxPosition.removeBorder(superview.borderMetrics()).flatten();
          }
          , moveTo: function (newPosition, restrictionCallback) {

            newPosition = new Superview.Rect(newPosition);
            newPosition.addBorder(superview.borderMetrics());

            superview.moveTo(newPosition.flatten(), restrictionCallback);

            return this;
          }
          , restrictTo: function (restrictions) {

            restrictions = new Superview.Restrictions(restrictions);
            var borderMetrics = superview.borderMetrics();

            restrictions.minimum.addBorder(borderMetrics);
            restrictions.maximum.addBorder(borderMetrics);

            superview.restrictTo(restrictions.flatten());

            return this;
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
})(jQuery);var KeyCodes = {
  Escape: 27,
  Return: 13
};Superview.CssFilter = (function () {

  function normalizeKey (cssKey) {
    return cssKey.toLowerCase().replace(/-/g, '');
  }

  var filters = [
    /^margin.*/i,
    /^padding.*/i,
    /^(min|max).*$/i,
    /^(left|right|top|bottom|width|height)$/i,
    /^position$/i,
    /^display$/i
  ];

  return {
    isAllowed: function (cssKey) {
      cssKey = normalizeKey(cssKey);

      for (var i = 0; i < filters.length; i++) {
        if (cssKey.match(filters[i])) return false;
      }

      return true;
    }
  } 
})();Superview.Page = (function () {
  
  var Page = function () {
    Object.extend(this).mixin(Superview);
  };
  
  Page.prototype = {
    initialize: function () {
      Superview.Window.install();
      this.$().addClass('page');
      this.addTo(Superview.Window);
      this.render();
      this.parent().initialize();
      return this;
    },
    fitWindow: function () {
      return this.anchorTo(Superview.Window, {
        width: true,
        height: true
      });
    },
  };
  
  return Page;
})();


;Superview.Rect = (function () {

  Rect = function (rect) {
    Object.extend(this).withObject(rect);
  }

  Rect.prototype = {
    has: function (member) {
      return this['has' + member.variableize(true)]();
    }
    , flatten: function () {
      var self = this,
          flat = {};

      ['top', 'left', 'bottom', 'right', 'width', 'height'].forEach(function (member) {
        if (typeof self[member] !== 'undefined') {
          flat[member] = self[member];
        }
      });

      return flat;
    }
    , removeBorder: function (borderMetrics) {
      if (this.hasWidth()) {
        this.width -= borderMetrics.width;
      }
      if (this.hasHeight()) {
        this.height -= borderMetrics.height;
      }
      if (this.hasTop()) {
        this.top += borderMetrics.top;
      }
      if (this.hasLeft()) {
        this.left += borderMetrics.left;
      }
      if (this.hasRight()) {
        this.right -= borderMetrics.right;
      }
      if (this.hasBottom()) {
        this.bottom -= borderMetrics.bottom;
      }
      return this;
    }
    , addBorder: function (borderMetrics) {
      if (this.hasWidth()) {
        this.width += borderMetrics.width;
      }
      if (this.hasHeight()) {
        this.height += borderMetrics.height;
      }
      if (this.hasTop()) {
        this.top -= borderMetrics.top;
      }
      if (this.hasLeft()) {
        this.left -= borderMetrics.left;
      }
      if (this.hasRight()) {
        this.right += borderMetrics.right;
      }
      if (this.hasBottom()) {
        this.bottom += borderMetrics.bottom;
      }
      return this;      
    }
  };

  ['Top', 'Right', 'Bottom', 'Left'].forEach(function (edge) {
    Rect.prototype['has' + edge] = function () {
      var edgeValue = this[edge.toLowerCase()];
      return (typeof edgeValue === 'number') && !isNaN(edgeValue) && edgeValue !== Infinity
    }
  });

  ['Width', 'Height'].forEach(function (dimension) {
    Rect.prototype['has' + dimension] = function () {
      var dimensionValue = this[dimension.toLowerCase()];
      return (typeof dimensionValue === 'number') && !isNaN(dimensionValue) && dimensionValue !== Infinity && dimensionValue >= 0;
    }
  });

  return Rect;
})();;Superview.Restrictions = (function () {

  Restrictions = function (restrictions) {
    restrictions = restrictions || {};
    Object.extend(this).withObject(restrictions);
    this.minimum = new Superview.Rect(restrictions.minimum);
    this.maximum = new Superview.Rect(restrictions.maximum);
  }

  Restrictions.prototype = {
    flatten: function () {
      var flat = {};

      flat.minimum = this.minimum.flatten();
      flat.maximum = this.maximum.flatten();

      return flat;
    }
  };

  ['Minimum', 'Maximum'].forEach(function (limit) {
    Restrictions.prototype['has' + limit] = function () {
      return typeof this[limit.toLowerCase()] === 'object';
    }
  })

  return Restrictions;
})();

;Superview.Window = (function () {
  
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
})();;