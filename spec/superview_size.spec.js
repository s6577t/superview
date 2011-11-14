describe('superview.size', function () {

  var view;

  beforeEach(function() {
    view = new Superview;
  });

  describe('css()', function () {
    it("should maintain size()", function() {
      view.resize({width: 100, height: 100});

      var size0 = view.size();

      view.css('border', 'solid 1px red');

      var size1 = view.size();

      expect(size0).toEqualRect(size1);
    });

    it("should not emit an on resized event if the border size changes", function() {
      spyOn(view.onResized(), 'emit');

      view.css('border', 'solid 1px red');

      expect(view.onResized().emit).not.toHaveBeenCalled();
    });

    it("should not emit an on resized event if the border size doesn't change", function() {
      view.css('border', 'solid 1px red');

      spyOn(view.onResized(), 'emit');

      view.css('border', 'solid 1px red');

      expect(view.onResized().emit).not.toHaveBeenCalled();
    });

    it("should adjust the css width/height of the element", function() {
      view.resize({width: 100, height: 100});

      view.css('border', 'solid 1px red');

      var cssSize = {
        width: parseInt(view.$().css('width')),
        height: parseInt(view.$().css('height'))
      }

      expect(cssSize).toEqualRect({
        width: 98,
        height: 98
      });
    });
  })

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

    it('should not fire the restriction callback if the resize is not resitrcted', function () {
      var called = false;

      view.resize({width: 301}, function () {
        called = true;
      });

      expect(called).toEqual(false);
    })

    describe('when the size is restricted', function () {

      it('should not set the dimensions to greater that the max', function () {
        view.restrictTo({
          maximum: {
            width: 300,
            height: 300
          }
        });
        view.resize({width: 301, height: 301});
        expect(view.size()).toEqualRect({
          width: 300,
          height: 300
        });
      });

      it('should not set the dimensions to less that the min', function () {
        view.restrictTo({
          minimum: {
            width: 301,
            height: 301
          }
        });
        view.resize({width: 300, height: 300});
        expect(view.size()).toEqualRect({width: 301, height: 301});
      });

      it('should be able to set the size to the maximum dimensions', function () {

        view.restrictTo({
          maximum: {
            width: 300,
            height: 300
          }
        });

        view.resize({width: 300, height: 300});

        expect(view.size()).toEqualRect({width: 300, height: 300});
      });

      it('should be able to set the size to the minimum dimensions', function () {

        view.restrictTo({
          minimum: {
            width: 300,
            height: 300
          }
        });

        view.resize({width: 300, height: 300});

        expect(view.size()).toEqualRect({width: 300, height: 300});
      });

      it('should callback if the resize is limited', function () {

        var called = false;

        view.restrictTo({maximum: {width: 300}});
        view.resize({width: 301}, function () {
          called = true;
        });

        expect(called).toEqual(true);
      });
    });
  });

  describe('size()', function () {
    it('does not return the internal size object', function () {
      expect(view.size()).not.toBe(view._size);
    });

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

      expect(view.size()).toEqualRect({width: 100, height: 200});
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