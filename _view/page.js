Page = function () {
  extend(this).mixin(View);
  
  
  var self = this;
  var zElem = this.z();

  z.body().css({
    padding: 0,
    margin: '0 auto'
  });
  
  zElem.id('page')
  .appendTo(z.body())
  .css({
    padding: 0,
    margin: '0 auto'
  });
  
  var _fit = proxyFunction(this, this.fit);
  this.fit = function (view_fit) {
    var r = _fit(view_fit);
    if (r !== this) {
      z.body().css({
        overflowX: (view_fit & View.Fit.Horizontal) ? 'hidden' : 'auto',
        overflowY: (view_fit & View.Fit.Vertical) ?   'hidden' : 'auto'
      });
    }    
    return r;
  };
  
  this.parentView(null);
  
  return this;
};