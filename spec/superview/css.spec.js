describe('superview.css()', function () {

  var view;

  beforeEach(function () {
    view = new Superview;
  })

  it("should return css values when called with a single string arg", function() {
    view.$().css('border-color', 'red');
    expect(view.css('border-color')).toEqual('red');
  });

  it("should be chainable when setting", function() {
    expect(view.css({cursor: 'pointer'})).toBe(view);
  });

  describe('size() effects', function () {

    it("should maintain the size() of the superview", function() {
      view.resize({width: 100, height: 100});

      var size0 = view.size();

      view.css('border', 'solid 1px red');

      var size1 = view.size();

      expect(size0).toEqualRect(size1);
    });

    it("should not emit an onResized event from the superview if the border size changes and doesn't affect the size", function() {
      view.resize({width: 100, height: 100});

      spyOn(view.onResized(), 'emit');

      view.css('border', 'solid 1px red');

      expect(view.onResized().emit).not.toHaveBeenCalled();
    });

    it("should emit an onResized event from the superview if the border size changes and affects the size", function() {
      spyOn(view.onResized(), 'emit');

      view.css('border', 'solid 1px red');

      expect(view.onResized().emit).toHaveBeenCalled();
    });

    it("should emit an onResized event from the superview.contentArea if the border size changes", function() {
      spyOn(view.contentArea().onResized(), 'emit');
      view.css({border: 'solid 20px blue'});
      expect(view.contentArea().onResized().emit).toHaveBeenCalled();
    });

    it("should not emit an onResized event if the border size doesn't change", function() {
      view.css('border', 'solid 1px red');

      spyOn(view.onResized(), 'emit');

      view.css('border', 'solid 1px red');

      expect(view.onResized().emit).not.toHaveBeenCalled();
    });

    it("should not emit an onResized event on the superview.contentArea if the border size doesn't change", function() {

      view.css('border', 'solid 1px red');

      spyOn(view.contentArea().onResized(), 'emit');

      view.css('border', 'solid 1px red');

      expect(view.contentArea().onResized().emit).not.toHaveBeenCalled();
    });

    it("should adjust the css width/height of the DOM element when setting a border", function() {
      view.resize({width: 100, height: 100});

      view.css('border', 'solid 1px red');

      var cssSize = {
        width: parseInt(view.$().css('width'), 10),
        height: parseInt(view.$().css('height'), 10)
      }

      expect(cssSize).toEqualRect({
        width: 98,
        height: 98
      });
    });

  });

  describe('position() effects', function () {

    it("should maintain the position() of the superview", function() {

      view.moveTo({top: 100, left: 100});

      var pos0 = view.position();

      view.css('border', 'solid 1px red');

      pos0.right += 2;
      pos0.bottom += 2;

      expect(view.position()).toEqualRect(pos0);
    });

    it("should not emit an onMoved event from the superview if the border size changes", function() {

      spyOn(view.onMoved(), 'emit');

      view.css('border', 'solid 1px red');

      expect(view.onMoved().emit).not.toHaveBeenCalled();
    });

    it("should emit an onMoved event from the superview.contentArea if the border size change affects the top and left coordinate", function() {
      spyOn(view.contentArea().onMoved(), 'emit');

      view.css('border', 'solid 10px red');

      expect(view.contentArea().onMoved().emit).toHaveBeenCalled();
    });

    it("should not emit an onMoved event if the border size doesn't change the top/left coordinate", function() {
      spyOn(view.contentArea().onMoved(), 'emit');

      view.css('border-right', 'solid 10px red');
      view.css('border-bottom', 'solid 10px red');

      expect(view.contentArea().onMoved().emit).not.toHaveBeenCalled();
    });

    it("should not emit an onMoved event if the border size doesn't change", function() {
      view.css('border', 'solid 1px red');

      spyOn(view.onMoved(), 'emit');

      view.css('border', 'solid 1px red');

      expect(view.onMoved().emit).not.toHaveBeenCalled();
    });

    it("should not emit an onMoved event on the superview.contentArea if the border size doesn't change", function() {
      view.css('border', 'solid 1px red');

      spyOn(view.contentArea().onMoved(), 'emit');

      view.css('border', 'solid 1px red');

      expect(view.contentArea().onMoved().emit).not.toHaveBeenCalled();
    });

    it("should change the position of the contentArea when setting a border", function() {

      view.moveTo({top: 100, left: 100});

      view.css('border', 'solid 1px red');

      expect(view.contentArea().position()).toEqualRect({
        top: 101,
        left: 101,
        right: 101,
        bottom: 101
      });
    });

  })

  describe('filtering', function () {

    var dissallowedExamples = [
    'margin',
    'margin-top',
    'margin-left',
    'margin-right',
    'margin-bottom',
    'marginRight',
    'marginBottom',
    'padding',
    'padding-top',
    'padding-bottom',
    'padding-left',
    'padding-right',
    'paddingRight',
    'PADDING-RIGHT',
    'left',
    'top',
    'bottom',
    'right',
    'max-width',
    'max-height',
    'min-width',
    'min-height',
    'minWidth',
    'width',
    'height',
    ];

    var allowedExamples = [
    'border-left-width',
    'font-size'
    ];

    it("should filter disallowed css settings", function() {

      dissallowedExamples.forEach(function (setting) {
        var view = new Superview;

        view.css(setting, 1234);
        expect(parseInt(view.css(setting), 10)).not.toEqual(1234);

        view = new Superview;

        var css = {};
        css[setting] = 5678;
        view.css(css);
        expect(parseInt(view.css(setting), 10)).not.toEqual(5678);
      });
    });

    it("should not filter allowed css settings", function() {

      allowedExamples.forEach(function (setting) {
        var view = new Superview;

        view.css(setting, 1234);
        expect(parseInt(view.css(setting), 10)).toEqual(1234);

        view = new Superview;

        var css = {};
        css[setting] = 5678;
        view.css(css);
        expect(parseInt(view.css(setting), 10)).toEqual(5678);
      });
    });

    it("should not allow the position to be changed from absolute", function() {
      view.css('position', 'relative');
      expect(view.css('position')).toEqual('absolute');
    });
  })
})