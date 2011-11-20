/*
  these specs include those which apply to both boundary and content area boxes as well as specs specific to the content area box
*/

describe('superview content area box', function () {

  describe('abstract box functionality', boxSpecs(function () {
    return new Superview().contentArea();
  }));

  describe("idiosyncratic functionality", function() {

    var view, contentArea;

    beforeEach(function () {
      view = new Superview;
      contentArea = view.contentArea();
      view.css({border: 'solid 5px red'});
    });

    describe("superview.contentArea().superview()", function() {
      it("should return the superview", function() {
        expect(contentArea.superview()).toBe(view);
      });
    });

    describe('superview.contentArea().size()', function () {

      it('should return the width and height excluding border', function () {

        view.resize({width: 100, height: 200});

        expect(contentArea.size()).toEqualRect({width: 90, height: 190});
      });
    });

    describe("superview.contentArea().resize()", function() {

      it("should pass on the call to the boundary box with adjusted arguments", function() {
        var adjustedSize;

        spyOn(view, 'resize').andCallFake(function (size) {
          adjustedSize = size;
        });

        contentArea.resize({width: 90, height: 90});

        expect(adjustedSize).toEqualRect({width: 100, height: 100});
      });
    });

    describe("superview.contentArea().position()", function() {

      it("should return the position of the content area within the border of the superview", function() {
        view.resize({width: 100, height: 100});
        expect(contentArea.position()).toEqualRect({top: 5, left: 5, right: 95, bottom: 95});
      });
    });

    describe("superview.contentArea().moveTo()", function() {

      it("should pass on the moveTo call to the superview boundary box with adjusted arguments", function() {
        var adjustedPosition;

        spyOn(view, 'moveTo').andCallFake(function (position) {
          adjustedPosition = position;
        });

        contentArea.moveTo({top: 90, left: 90});

        expect(adjustedPosition).toEqualRect({top: 85, left: 85});
      });
    });
  });
})