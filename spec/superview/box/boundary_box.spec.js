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

        expect(parseInt(view.$().css('top'))).toEqual(123);
        expect(parseInt(view.$().css('left'))).toEqual(456);

        var css = {
          left: parseInt(view.$().css('left')),
          top: parseInt(view.$().css('top'))
        };

        expect(css).toEqualRect({
          top: 123,
          left: 456
        });
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