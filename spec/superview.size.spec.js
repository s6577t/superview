describe('superview.size', function () {
  
  var view;
  
  beforeEach(function() {
    view = new Superview;
  });
  
  describe('resize()', function () {

    beforeEach(function () {
      view.$().css({border: 'solid 13px red'});
    })

    it('should pass on the dimensions to the dom element without any border', function () {
      view.$().css({
        border: 'solid 5px red'
      });
      
      view.resize({width: 123, height: 456});
      
      expect(view.$().width()).toEqual(113);
      expect(view.$().height()).toEqual(446);

      expect(view.$().outerWidth()).toEqual(123);
      expect(view.$().outerHeight()).toEqual(456);
    });

    it('should emit an onResized event with the view', function () {
      spyOn(view.onResized(), 'emit').andCallThrough();

      var v;

      view.onResized(function (a) {
        v = a;
      });

      var s = {width: 123, height: 456};
      view.resize(s);

      expect(view.onResized().emit).toHaveBeenCalled();
      expect(v).toBe(view);
      expect(view.size()).toEqualRect(s);
    });

    it('should not emit an onResized event if the size set is the same as the current size', function () {
      view.resize({width: 123, height: 456});

      spyOn(view.onResized(), 'emit');
      view.resize({width: 123, height: 456});

      expect(view.onResized().emit).not.toHaveBeenCalled();
    });

    xit('should not set the dimensions to greater that the max', function () {
      NotImpemented()
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

    xit('should not set the dimensions to less that the min', function () {
      NotImplemented()
      view.restrictTo({
        minimum: {
          width: 301,
          height: 301
        }
      });
      view.resize({width: 300, height: 300});
      expect(view.rect()).toBeTheSameSizeAs({width: 301, height: 301});
    });

    xit("should fire a callback when the size is limited by maximum", function () {
      NotImplemented()
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

    xit("should fire a callback when the size is limited by minimum", function () {
      NotImplemented()
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

    xit('should be able to set the size to the maximum dimensions', function () {
      NotImplemented()
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

    xit('should be able to set the size to the minimum dimensions', function () {
      NotImplemented()
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

    xit('should not include borders by default', function () {
      view.resize({width: 334, height: 123});
      expect(view.size()).toEqualRect({width: 334, height: 123});
      expect(view.size()).toEqualRect({width: view.$().width(), height: view.$().height()});
    })

    xdescribe('when including the border', function () {
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
  });

  describe('size()', function () {
    it('should be all zero on a new view', function () {
      "width,height".split(",").forEach(function(m) {
        expect(view.size()[m]).toEqual(0);
      })
    });

    it('should return the width and height including border', function () {
      view.$().css({
        border: 'solid 5px red'
      });

      view.resize({width: 100, height: 200});

      var r = view.size();
      
      expect(r).toEqualRect({width: 110, height: 210});
    });
    
    xit('should return the width and height excluding border with the includeBorder option set to false', function () {
      
      view.$().css({
        border: 'solid 5px red'
      });

      view.resize({width: 100, height: 200});

      var r = view.size({includeBorder: false});
      
      expect(r).toEqualRect({width: 100, height: 200});
    });
  });
  
  describe('borderMetrics()', function () {
    
    it('should return the correct values', function () {
      
      view.$().css({
        borderTop: 1,
        borderBottom: 2,
        borderLeft: 3,
        borderRight: 4
      });
      
      expect(view.borderMetrics()).toEqualRect({
        top: 1,
        left: 3,
        bottom: 2,
        right: 4,
        width: 7,
        height: 3
      });
    });
  })
})