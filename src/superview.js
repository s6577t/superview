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
      _subviews: {},
      _uuid: uuid(),
      _zElem: z.div().css({
        overflow: 'hidden',
        display: 'inline-block',
        position: 'absolute',
        left: 0,
        right: 0
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
    uuid: function() { 
      return this._uuid; 
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
    css: function () {
      if (arguments.length === 0) {
        return this;
      }
      if (arguments.length === 1) {
        return this._zElem.css.apply(this._zElem, arguments);
      }
      
      this._zElem.css.apply(this._zElem, arguments);
      return this;
    },
    /*
      View tree members
    */
    addSubview: function (view) {
     this.z().append(view.elem());
     view.setParentView(this);
     this._subviews[view.uuid()] = view;
     
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
      parentView._subviews[this.uuid()] = this;
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
        delete parentView._subviews[this.uuid()];
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
      return {
        top:    function () { return parseFloat(z.css('borderTopWidth')) || 0 },
        right:  function () { return parseFloat(z.css('borderRightWidth')) || 0 },
        bottom: function () { return parseFloat(z.css('borderBottomWidth')) || 0 },
        left:   function () { return parseFloat(z.css('borderLeftWidth')) || 0 },
        width:  function () { return this.right() + this.left() },
        height: function () { return this.top() + this.bottom() }
      };
    },
    paddingMetrics: function () {
      var self = this;
      var z = this.z();
      return {
        top:    function () { return parseFloat(z.css('paddingTop')) || 0 },
        right:  function () { return parseFloat(z.css('paddingRight')) || 0 },
        bottom: function () { return parseFloat(z.css('paddingBottom')) || 0 },
        left:   function () { return parseFloat(z.css('paddingLeft')) || 0 },
        width:  function () { return this.right() + this.left() },
        height: function () { return this.top() + this.bottom() }
      };
    },
    
    setSize: function (s) {
      var resized = false;
      var z = this.z();
      var r = this.getRect();
      
      if (typeof s.width === 'number' && s.width != r.width()) {
        resized = true;
        r.width(s.width);
        z.css('width', r.width());
      }
      
      if (typeof s.height === 'number' && s.height != r.height()) {
        resized = true;
        r.height(s.height);
        z.css('height', r.height());
      }
      
      if (resized) {
        this.onResized().emit(this, r, this.getOuterRect());
      }
      
      return this;
    },
    setOuterSize: function (s) {
      var z = this.z();
      
      if (typeof s.width === 'number') {
        s.width = s.width - (this.paddingMetrics().width() + this.borderMetrics().width());
      }
      
      if (typeof s.height === 'number') {
        s.height = s.height - (this.paddingMetrics().height() + this.borderMetrics().height());
      }
      
      return this.setSize(s);
    },
    
    moveTo: function (p) {
      var moved = false;
      var z = this.z();
      var r = this.getRect();
      
      if (typeof p.top === 'number' && p.top != r.top()) {
        moved = true;
        r.top(p.top + this.paddingMetrics().top() + this.borderMetrics().top());
        z.css('top', r.top());
      }
      
      if (typeof p.left === 'number' && p.left != r.left()) {
        moved = true;
        r.left(p.left + this.paddingMetrics().left() + this.borderMetrics().left());
        z.css('left', r.left());
      }
      
      if (moved) {
        this.onMoved().emit(this, r, this.getOuterRect());
      }
      
      return this;
    },
    moveOuterTo: function (p) {
      var z = this.z();
      
      if (typeof p.top === 'number') {
        p.top = p.top - (this.paddingMetrics().top() + this.borderMetrics().top());
      }
      
      if (typeof p.left === 'number') {
        p.left = p.left - (this.paddingMetrics().left() + this.borderMetrics().left());
      }
      
      return this.moveTo(p);
    },
    
    getRect: function () {
      var z = this.z();
      var p = {
        left: parseFloat(z.css('left')),
        top: parseFloat(z.css('top'))
      };
 
      return new Superview.Rect({
        top: p.top + this.paddingMetrics().top() + this.borderMetrics().top(),
        left: p.left + this.paddingMetrics().left() + this.borderMetrics().left(),
        width: z.width(),
        height: z.height() 
      });
    },
    getOuterRect: function () {
      var z = this.z();
      var p = {
        left: parseFloat(z.css('left')),
        top: parseFloat(z.css('top'))
      };
      
      return new Superview.Rect({
        top: p.top ,
        left: p.left,
        width: z.outerWidth(),
        height: z.outerHeight() 
      });
    }
  }
  
})(jQuery)