/* doesn't ACTUALLY test superview.rect.js but instead the methods that use it ;) */
describe('superview.rect', function () {
  
  beforeEach(function() {
    this.addMatchers({
      toBeInTheSamePositionAs: function (r) { 
        return Superview.Rect.samePosition(this.actual, r);
      },
      toBeTheSameSizeAs: function (r) { 
        return Superview.Rect.sameSize(this.actual, r);
      },
      toEqualRect: function (r) {
        return Superview.Rect.areEqual(this.actual, r);
      }
    });
  });
  
  describe('resize()', function () {
    var view;

    beforeEach(function () {
      view = new Superview;
    })

    it('should pass on the dimensions to the dom element', function () {
      var v = new Superview();
      v.resize({width: 123, height: 456});
      expect(v.$().width()).toEqual(123);
      expect(v.$().height()).toEqual(456);
    });

    it('should emit an onResized event with the view,rect,outerRect', function () {
      var v = new Superview();

      spyOn(v.onResized(), 'emit').andCallThrough();

      var view, size, outerSize;

      v.onResized(function (a, b, c) {
        view = a;
        size = b;
        outerSize = c;
      });

      var s = {width: 123, height: 456};
      v.resize(s);

      expect(v.onResized().emit).toHaveBeenCalled();
      expect(view).toBe(v);
      expect(size).toEqualRect(s);
    });

    it('should not emit an onResized event if the size set is the same as the current size', function () {
      var v = new Superview();
      v.resize({width: 123, height: 456});

      spyOn(v.onResized(), 'emit');
      v.resize({width: 123, height: 456});

      expect(v.onResized().emit).not.toHaveBeenCalled();
    });
  
    it('should not set the dimensions to greater that the max', function () {
      view.restrictTo({
        maximum: {
          width: 300,
          height: 300
        }
      });
      view.resize({width: 301, height: 301});
      expect(view.rect().width).toBe(300);
      expect(view.rect().height).toBe(300);
    });
    
    it('should not set the dimensions to less that the min', function () {
      view.restrictTo({
        minimum: {
          width: 301,
          height: 301
        }
      });
      view.resize({width: 300, height: 300});
      expect(view.rect()).toBeTheSameSizeAs({width: 301, height: 301});
    });
    
    it("should fire a callback when the size is limited by maximum", function () {
      view.restrictTo({
        maximum: {
          width: 40,
          height: 40
        }
      });
      
      
      var called = false;
      
      view.resize({width: 41, height: 41}, function () {
        called = true;
      });
      
      expect(called).toBe(true);
    });
    
    it("should fire a callback when the size is limited by maximum", function () {

      view.resize({width: 60, height: 60});

      view.restrictTo({
        minimum: {
          width: 40,
          height: 40
        }
      });
      
      
      var called = false;
      
      view.resize({width: 39, height: 39}, function () {
        called = true;
      });
      
      expect(called).toBe(true);
    });
    
    it('should be able to set the size to the maximum dimensions', function () {
      view.restrictTo({
        maximum: {
          width: 300,
          height: 300
        }
      });

      var called = false;
      view.resize({width: 300, height: 300}, function () {
        called = true;
      });

      expect(view.rect()).toBeTheSameSizeAs({width: 300, height: 300});
      expect(called).toBe(false);
    });
    
    it('should be able to set the size to the minimum dimensions', function () {
      view.restrictTo({
        minimum: {
          width: 300,
          height: 300
        }
      });

      var called = false;
      view.resize({width: 300, height: 300}, function () {
        called = true;
      });

      expect(view.rect()).toBeTheSameSizeAs({width: 300, height: 300});
      expect(called).toBe(false);
    });
  });

  describe('outerResize()', function () {
    it('should set the size inclusive of padding and border', function () {

      var v = new Superview();
      v.$().css({
        border: 'solid 10px black',
        padding: 10
      });

      var s = {width: 123, height: 456};
      v.outerResize(s);

      expect(v.rect().width).toEqual(83);
      expect(v.rect().height).toEqual(416);
    });

    it('should retrieve the size inclusive of border and padding', function () {
      var v = new Superview();
      v.outerResize({width: 123, height: 456});
      expect(v.$().outerWidth()).toEqual(123);
      expect(v.$().outerHeight()).toEqual(456);
    });

    it('should pass on the call to resize', function () {
      var v = new Superview();
      var callback;
      spyOn(v, 'resize').andCallFake(function (size, _callback) {
        callback = _callback;
      });

      var passedCallback = function () {};

      v.outerResize({width: 123, height: 456}, passedCallback);
      
      expect(v.resize).toHaveBeenCalled();
      expect(callback).toBe(passedCallback);
    });
  });

  describe('moving the inner position of an element', function () {
    it('should pass on the position to the dom element', function () {
      var v = new Superview();
      v.moveTo({top: 123, left: 456});
      expect(v.rect().top).toEqual(123);
      expect(v.rect().left).toEqual(456);
    });

    it('should emit an onMoved event with the view,rect,outerRect', function () {
      var v = new Superview();

      spyOn(v.onMoved(), 'emit').andCallThrough();

      var view, pos, outerPos;

      v.onMoved(function (a, b, c) {
        view = a;
        pos = b;
        outerPos = c;
      });  

      var p = {top: 123, left: 456};
      v.moveTo(p);

      expect(v.onMoved().emit).toHaveBeenCalled();
      expect(view).toBe(v);
      expect(pos).toBeInTheSamePositionAs(p);
      expect(outerPos).not.toBeNull();
    });

    it('should not emit an onMoved event if the position set is the same as the current position', function () {
      var v = new Superview();
      v.moveTo({top: 123, left: 456});

      spyOn(v.onMoved(), 'emit');
      v.moveTo({top: 123, left: 456});

      expect(v.onMoved().emit).not.toHaveBeenCalled();
    });

    it('should correctly set the position with disregard for border and padding', function () {
      var v = new Superview();

      v.$().css({
        borderWidth: 5,
        padding: 15
      });

      v.resize({width: 50, height: 60});
      v.moveTo({top: 200, left: 300});

      var rect = v.rect(),
          outer = v.outerRect();

      expect(rect.left).toEqual(300);
      expect(rect.top).toEqual(200);  
      expect(rect.right).toEqual(300+50);
      expect(rect.bottom).toEqual(200+60); 

      expect(outer.left).toEqual(300 - 20);
      expect(outer.top).toEqual(200-20);  
      expect(outer.right).toEqual(300+50+20);
      expect(outer.bottom).toEqual(200+60+20); 
    });

    it('should translate calls with right/bottom to calls with left/top', function () {
      var v = new Superview();

      v.$().css({
        borderWidth: 5,
        padding: 15
      });

      v.resize({width: 50, height: 60});
      v.moveTo({right: 200, bottom: 300});

      var rect = v.rect(),
          outer = v.outerRect();

      expect(rect.left).toEqual(200 - 50);
      expect(rect.top).toEqual(300 - 60);  
      expect(rect.right).toEqual(200);
      expect(rect.bottom).toEqual(300); 

      expect(outer.left).toEqual(200 - 50 - 20);
      expect(outer.top).toEqual(300 - 60 -20);  
      expect(outer.right).toEqual(200 + 20);
      expect(outer.bottom).toEqual(300 + 20); 
    });
  });

  describe('moving the outer positon of an element (outerMoveTo())', function () {
    it('should move the element relative to the view area incl border and padding', function () {
      var v = new Superview();

      v.$().css({
        border: 'solid 3px black',
        padding: 17
      });

      v.outerMoveTo({top: 150, left: 200});
      v.outerResize({width: 400, height: 300});

      var rect = v.rect(), 
          outer = v.outerRect();

      expect(rect.top).toEqual(150 + 20);
      expect(rect.left).toEqual(200 + 20);
      expect(rect.right).toEqual(580);
      expect(rect.bottom).toEqual(430);

      expect(outer.top).toEqual(150);
      expect(outer.left).toEqual(200);
      expect(outer.right).toEqual(600);
      expect(outer.bottom).toEqual(450);
    });

    it('should translate right/bottom into left/top', function () {
      var v = new Superview();

      v.$().css({
        border: 'solid 3px black',
        padding: 17
      });

      v.outerResize({width: 350, height: 300});
      v.outerMoveTo({bottom: 650, right: 800});

      var rect = v.rect(), 
          outer = v.outerRect();

      expect(rect.top).toEqual(370);
      expect(rect.left).toEqual(470);
      expect(rect.right).toEqual(780);
      expect(rect.bottom).toEqual(630);

      expect(outer.top).toEqual(350);
      expect(outer.left).toEqual(450);
      expect(outer.right).toEqual(800);
      expect(outer.bottom).toEqual(650);
    });

    it('should pass on the call to moveTo', function () {
      var v = new Superview();
      spyOn(v, 'moveTo');
      v.outerMoveTo({left: 123, top: 456});
      expect(v.moveTo).toHaveBeenCalled();
    });
  });

  describe('rect()', function () {
    it('should be all zero on a new view', function () {
      var v = new Superview();
      var r = v.rect()
      "top,left,bottom,right,width,height".split(",").forEach(function(m) {
        expect(r[m]).toEqual(0);
      })
    });

    it('should returns the width, height top and left of the element excluding border and padding', function () {
      var v = new Superview();

      v.$().css({
        border: 'solid 15px red',
        padding: 5
      });

      v.resize({width: 123, height: 456});
      v.moveTo({top: 45, left: 101});

      var r = v.rect();

      expect(r.width).toEqual(123);
      expect(r.height).toEqual(456);
      expect(r.top).toEqual(45);
      expect(r.left).toEqual(101);
      expect(r.right).toEqual(101+123);
      expect(r.bottom).toEqual(45+456);
    });
  });

  describe('outerRect()', function () {
    it('should returns the width, height top and left of the element including border and padding', function () {
      var v = new Superview();

      v.$().css({
        border: 'solid 15px red',
        padding: 5
      }); 

      v.resize({width: 123, height: 456});
      v.moveTo({top: 45, left: 101});
      var r = v.outerRect();

      expect(r.top).toEqual(45 - 20);
      expect(r.left).toEqual(101 - 20);
      expect(r.right).toEqual(101 + 123 + 20);
      expect(r.bottom).toEqual(45 + 456 + 20);
      expect(r.width).toEqual(123 + 20 + 20);
      expect(r.height).toEqual(456 + 20 + 20);
    });
  });

  describe('paddingMetrics()', function () {

    var v;

    beforeEach(function () {
      v = new Superview();
      v.$().css({
        paddingTop: 1,
        paddingBottom: 2,
        paddingLeft: 3,
        paddingRight: 4
      });
    });

    it('top should return top', function () {
      expect(v.paddingMetrics().top).toEqual(1);
    });
    it('left should return left', function () {
      expect(v.paddingMetrics().left).toEqual(3);
    });
    it('bottom should return bottom', function () {
      expect(v.paddingMetrics().bottom).toEqual(2);
    });
    it('right should return right', function () {
      expect(v.paddingMetrics().right).toEqual(4);
    });
    it('width should return left+right', function () {
      expect(v.paddingMetrics().width).toEqual(7);
    });
    it('height should return top+bottom', function () {
      expect(v.paddingMetrics().height).toEqual(3);
    });
  })

  describe('borderMetrics()', function () {
    var v;

    beforeEach(function () {
      v = new Superview();
      v.$().css({
        borderTop: 1,
        borderBottom: 2,
        borderLeft: 3,
        borderRight: 4
      });
    });

    it('top should return top', function () {
      expect(v.borderMetrics().top).toEqual(1);
    });
    it('left should return left', function () {
      expect(v.borderMetrics().left).toEqual(3);
    });
    it('bottom should return bottom', function () {
      expect(v.borderMetrics().bottom).toEqual(2);
    });
    it('right should return right', function () {
      expect(v.borderMetrics().right).toEqual(4);
    });
    it('width should return left+right', function () {
      expect(v.borderMetrics().width).toEqual(7);
    });
    it('height should return top+bottom', function () {
      expect(v.borderMetrics().height).toEqual(3);
    });
  })

  describe('restrictTo()', function () {
    var view;
    
    beforeEach(function () {
      view = new Superview;
    })  
    
    it('should return an empty size limit object by default', function () {
      expect(view.restrictions()).toEqualRect({});
    })
    
    it("should be chainable", function() {
      var r = view.restrictTo({});
      expect(r).toBe(view);
    });  
    
    it('should update the current size when the minimum size is set', function () {
      view.resize({width: 0, height: 0});
      
      view.restrictTo({
        minimum: {
          width: 30,
          height: 30
        }
      });
      
      expect(view.rect()).toEqualRect({width: 30, height: 30});
    })
    
    it('should update the current size when the maximum size is set', function () {
      view.resize({width: 500, height: 500});
      
      view.restrictTo({
        maximum: {
          width: 100,
          height: 100
        }
      });
      
      expect(view.rect()).toEqualRect({width: 100, height: 100});
    });
    
    it("should not change the size if the current size is within the bounds", function() {
      view.resize({width: 150, height: 150});
      
      view.restrictTo({
        minimum: {
          width: 100,
          height: 100
        },
        maximum: {
          width: 200,
          height: 200
        }
      });
      
      expect(view.rect()).toEqualRect({width: 150, height: 150});
    });
    
    it("should throw an error if the minimum is greater than the maximum", function() {
      expect(function () {
        view.restrictTo({
          minimum: {
            width: 300,
            height: 200
          },
          maximum: {
            width: 299,
            height: 199
          }
        })
      }).toThrowAnError();
    });
    
    it('should accept an empty object as no limits', function () {
  })

  describe('restrictions()', function () {
    it("should return the current size limit for the view", function() {
      var view = new Superview;
      view.restrictTo({width: 141, height: 92});
      expect(view.restrictions()).toEqualRect({width: 141, height: 92});
    });
  });
  
  describe('outerRestrictTo()', function () {
    var view;
    
    beforeEach(function () {
      view = new Superview;
      view.$().css({
        border: 10,
        padding: 30
      })
    })

    it('should translate the call down to a restrictTo() equivalent and call it', function () {

      spyOn(view, 'restrictTo').andCallFake(function (restrictions) {
        expect(restrictions.minimum).toEqualRect({
          width: 60,
          height: 60
        });
        expect(restrictions.maximum).toEqualRect({
          width: 160,
          height: 160
        });
      });

      view.outerRestrictTo({
        minimum: {
          width: 100,
          height: 100
        },
        maximum: {
          width: 200,
          height: 200
        }
      });
      
      expect(view.restrictTo).toHaveBeenCalled();
    })
  });

  describe('outerRestrictions()', function () {
    it("should return the current outer size limit for the view", function() {
      var view = new Superview;
      view.outerRestrictTo({width: 141, height: 92});
      expect(view.outerRestrictions()).toEqualRect({width: 141, height: 92});
    });
  })
})