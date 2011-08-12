(function ($) {
  View = function () {
      
    Events(this).define( 
      'onResize', // takes a size object as a parameter onResize({width:?, height:?});
      'onMove' // takes a position object
    );
    
    extend(this).with({
      hasViewMixin: true,
      _controller: null,
      _parentView: null,
      _subviews: [],
      _fit: View.Fit.Horizontal,
      _zElem: z.div().css({
        display: 'inline-block',
        position: 'absolute'
      })
    });    
  }
  
  View.prototype = {
    id: function(id) { 
      return this._zElem.id(id); 
    },
    isRootView: function () { 
      return !this.parentView(); 
    },
    controller: function (c) {
      if (c) {
        this._controller = c;
        return this;
      } else {
        return this._controller;
      }
    },    
    elem: function () { 
      return this._zElem.elem(); 
    },
    z: function () { 
      return this._zElem; 
    },
    addSubView: function (view) {
     this._zElem.append(view.elem());
     view.parentView(this);
     this._subviews.push(view);
     return this;
    },
    // removeSubViews(list, of, subviews) OR removeSubViews(ONE_ARRAY)
    removeSubViews: function () {
      
      var subviewsToRemove = $.isArray(arguments[0]) ? arguments[0] : arguments;
      
      subviewsToRemove.forEach(function (subview) {
        subview.z().remove();
        subview.parentView(null);
      });
      
      var newSubviews = [];
      
      this._subviews.forEach(function(subview) {
        if (subviewsToRemove.indexOf(subview) === -1) {
          newSubviews.push(subview);
        }
      });
      
      this._subviews = newSubviews;
      
      return this;
    },
    removeAllSubviews: function () {
      return removeSubviews(this._subviews);
    },
    // pass null to set as root view
    parentView: function (newParentView) {
      
      if (typeof newParentView === 'undefined') {
        return this._parentView;
      } else {
        
        var me = this; // the view descendent
        var rootParent = this.z().parent().elem().nodeName === 'BODY' ? z.window() : this.z().parent();

        function handleParentResize () {
          
          var parent_size = me.isRootView() ? { width: rootParent.width(), height: rootParent.height() } : me.parentView().size();
          var size = me.size();

          if (this._fit & View.Fit.Horizontal) {
            size.width = parent_size.width;
          }

          if (this._fit & View.Fit.Vertical) {
            size.height = parent_size.height;
          }

          me.size(size);
        };
        
        // unbind from the window resize if I'm the root view and the parent view otherwise
        if (this.isRootView()) {
          rootParent.unbind('resize', handleParentResize);
        } else {
          this._parentView.onResize().unbind(handleParentResize);
        }
        
        this._parentView = newParentView;
        
        // bind to the window resize if I'm the root view and the parent view otherwise
        if (this.isRootView()) {
          rootParent.bind('resize', handleParentResize);
        } else {
          this._parentView.onResize(handleParentResize);
        }
        
        return this;        
      }
    },
    // size ({width: w, height: h})
    size: function (size) {
      
      var resized = false;
      if (size) {
        
        if (typeof size.width ==='number' && size.width != this._zElem.width()) {
          this._zElem.width(size.width).css({
            minWidth: size.width,
            maxWidth: size.width
          });
          resized = true;
        }
        
        if (typeof size.height ==='number' && size.height != this._zElem.height()) {
          this._zElem.height(size.height).css({
            minHeight: size.height,
            maxHeight: size.height
          });
          resized = true; 
        }
      }  
        
      if (resized) {
        this.onResize().emit(size); 
        return this;
      } else {
        return {
          width: this._zElem.width(),
          height: this._zElem.height()
        };
      }
    },
    // position ({left:x, top:y})
    position: function (position) {
      
      var current_position = this._zElem.position();
      
      using (this.outerSize(), function (size) {
        current_position.right = current_position.left + this.width;
        current_position.bottom = current_position.top + this.height;
      });
            
      if (position) {
        var moved = false;
        
        if (typeof position.left ==='number' && position.left != current_position.left) {
          this._zElem.css({
            left: position.left
          });
          moved = true;
        }
        
        if (typeof position.top ==='number' && position.top != current_position.top) {
          this._zElem.css({
            top: position.top
          });
          moved = true; 
        }
        
        if (moved) {
          this.onMove().emit(position); 
        }
        
        return this;
      } else {
        return current_position;
      }
    },
    borderMetrics: function () {
      var self = this;
      return {
        top:    function () { return parseFloat(self._zElem.css('borderTopWidth')) || 0 },
        right:  function () { return parseFloat(self._zElem.css('borderRightWidth')) || 0 },
        bottom: function () { return parseFloat(self._zElem.css('borderBottomWidth')) || 0 },
        left:   function () { return parseFloat(self._zElem.css('borderLeftWidth')) || 0 },
        width:  function () { return this.right() + this.left() },
        height: function () { return this.top() + this.bottom() }
      };
    },
    paddingMetrics: function () {
      var self = this;
      return {
        top:    function () { return parseFloat(self._zElem.css('paddingTop')) || 0 },
        right:  function () { return parseFloat(self._zElem.css('paddingRight')) || 0 },
        bottom: function () { return parseFloat(self._zElem.css('paddingBottom')) || 0 },
        left:   function () { return parseFloat(self._zElem.css('paddingLeft')) || 0 },
        width:  function () { return this.right() + this.left() },
        height: function () { return this.top() + this.bottom() }
      };
    },
    outerSize: function (outer_size) {
      if (outer_size) {
        var size = {
          width: outer_size.width - (this.borderMetrics().width() + this.paddingMetrics().width()),
          height: outer_size.height - (this.borderMetrics().height() + this.paddingMetrics().height())
        };
        return this.size(size);        
      } else {
        return {
          width: this._zElem.outerWidth(),
          height: this._zElem.outerHeight()
        };
      }
    },
    fit: function (view_fit) {
      if (typeof view_fit === 'number' && View.Fit.isValid(view_fit)) {
        if (this._fit !== view_fit) {
          this._fit = view_fit;
          this._zElem.css('overflow-x', (this._fit & View.Fit.Horizontal) ? 'hidden' : 'auto');
          this._zElem.css('overflow-y', (this._fit & View.Fit.Vertical) ? 'hidden' : 'auto');
        }
        return this;
      } else {
        return this._fit;
      }      
    },
    updateLayout: function () {
      
      var outer_size = {};
      var parent_size = this.isRootView() ? { width: z.window().width(), height: z.window().height() } :  this._parentView.size();

      if (this._fit & View.Fit.Horizontal) {
        outer_size.width = parent_size.width;
      }
      
      if (this._fit & View.Fit.Vertical) {
        outer_size.height = parent_size.height;
      }
      
      this.outerSize(outer_size);
      
      return this;
    }
  }
  
  View.Fit = new Flags({
    None: 0,
    Horizontal: 1,
    Vertical: 2,
    Maximize: 3    
  });
  
})(jQuery);