/*
  these specs include those which apply to both boundary and content area boxes as well as specs specific to the boundary box
*/

describe('superview boundary box', function () {

  describe('abstract box functionality', boxSpecs(function () {
    return new Superview;
  }));

  describe("idiosyncratic functionality", function() {

    var view;

    beforeEach(function () {
      view = new Superview;
    })

    describe('superview.size()', function () {

      it('does not return the internal size object', function () {
        expect(view.size()).not.toBe(view._size);
      });

      it('should return the width and height including border', function () {
        view.$().css({
          border: 'solid 5px red'
        });

        view.resize({width: 100, height: 200});

        expect(view.size()).toEqualRect({width: 100, height: 200});
      });
    });

    describe('superview.resize()', function () {

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
      
      it("should not resize to less than the border allows", function() {
        view.resize({width: 100, height: 100});
        view.css('border', 'solid 10px green');
        view.resize({width: 1, height: 1});
        expect(view.size()).toEqualRect({
          width: 20,
          height: 20
        })
      });
    });

    describe('superview.position()', function () {
      
      it('does not return the internal position object', function () {
        expect(view.position()).not.toBe(view._position);
      });

      it("should return the outer boundary box position including border", function() {
        view.resize({width: 100, height: 150});
        view.moveTo({top: 5, left: 10});
        // the border size makes no difference to the size of a boundary box
        view.css('border', 'solid 5px red');

        var position = view.position();

        expect(position).toEqualRect({
          top: 5,
          left: 10,
          right: 110,
          bottom: 155
        })
      });
    });

    describe('superview.moveTo()', function() {

      it('should pass on the position to the dom element', function () {
        view.moveTo({top: 123, left: 456});

        expect(parseInt(view.$().css('top'), 10)).toEqual(123);
        expect(parseInt(view.$().css('left'), 10)).toEqual(456);

        var css = {
          left: parseInt(view.$().css('left'), 10),
          top: parseInt(view.$().css('top'), 10)
        };

        expect(css).toEqualRect({
          top: 123,
          left: 456
        });
      });
    });

    describe("superview.restrictTo()", function() {
      it('should update the current size when the minimum size is set', function () {
        view.resize({width: 0, height: 0});

        spyOn(view, 'resize').andCallThrough();

        view.restrictTo({
          minimum: {
            width: 30,
            height: 30
          }
        });

        expect(view.size()).toEqualRect({width: 30, height: 30});
        expect(view.resize).toHaveBeenCalled();
      })

      it('should update the current size when the maximum size is set', function () {
        view.resize({width: 500, height: 500});

        spyOn(view, 'resize').andCallThrough();

        view.restrictTo({
          maximum: {
            width: 100,
            height: 100
          }
        });

        expect(view.size()).toEqualRect({width: 100, height: 100});
        expect(view.resize).toHaveBeenCalled();
      });

      it('should update the current position when the maximum position is set', function () {
        view.moveTo({top: 500, left: 500});

        spyOn(view, 'moveTo').andCallThrough();

        view.restrictTo({
          maximum: {
            top: 100,
            left: 100
          }
        });

        expect(view.position()).toEqualRect({top: 100, left: 100, bottom: 100, right: 100});
        expect(view.moveTo).toHaveBeenCalled();
      });

      it('should update the current position when the minimum position is set', function () {
        view.moveTo({top: 500, left: 500});

        spyOn(view, 'moveTo').andCallThrough();

        view.restrictTo({
          minimum: {
            top: 600,
            left: 600
          }
        });

        expect(view.position()).toEqualRect({top: 600, left: 600, bottom: 600, right: 600});
        expect(view.moveTo).toHaveBeenCalled();
      });

      
    });

    describe("superview.restrictions()", function() {
      it("should not return the internally maintained object", function() {

        var internal = view._restrictions;
        var rtn = view.restrictions();

        expect(internal).not.toBe(rtn);
        expect(internal.minimum).not.toBe(rtn.minimum);
        expect(internal.maximum).not.toBe(rtn.maximum);
      });
    });
  });
})