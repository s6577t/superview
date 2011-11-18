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

  describe('size effects', function () {

    it("should maintain the size() of the superview", function() {
      view.resize({width: 100, height: 100});

      var size0 = view.size();

      view.css('border', 'solid 1px red');

      var size1 = view.size();

      expect(size0).toEqualRect(size1);
    });
        
    it("should not emit an onResized event from the superview if the border size changes", function() {
      spyOn(view.onResized(), 'emit');

      view.css('border', 'solid 1px red');

      expect(view.onResized().emit).not.toHaveBeenCalled();
    });

    it("should emit an onResized event from the superview.contentArea if the border size changes", function() {
      fail
    });

    it("should not emit an onResized event if the border size doesn't change", function() {
      view.css('border', 'solid 1px red');

      spyOn(view.onResized(), 'emit');

      view.css('border', 'solid 1px red');

      expect(view.onResized().emit).not.toHaveBeenCalled();
    });
    
    it("should not emit an onResized event on the superview.contentArea if the border size doesn't change", function() {
      fail
      return;
      
      view.css('border', 'solid 1px red');

      spyOn(view.onResized(), 'emit');

      view.css('border', 'solid 1px red');

      expect(view.onResized().emit).not.toHaveBeenCalled();
    });

    it("should adjust the css width/height of the DOM element when setting a border", function() {
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

  });
  
  describe('position effects', function () {

    it("should maintain the position() of the superview", function() {
      fail
      //review...
      view.moveTo({top: 100, left: 100});

      var pos0 = view.position();

      view.css('border', 'solid 1px red');

      var pos1 = view.position();

      expect(pos0).toEqualRect(pos1);
    });
        
    it("should not emit an onMoved event from the superview if the border size changes", function() {
      fail
      // review
      spyOn(view.onMoved(), 'emit');

      view.css('border', 'solid 1px red');

      expect(view.onMoved().emit).not.toHaveBeenCalled();
    });

    it("should emit an onMoved event from the superview.contentArea if the border size change affects the top and left coordinate", function() {
      fail
    });
    
    it("should not emit an onMoved event if the border size doesn't change the top/left coordinate", function() {
      fail
      
      view.css('border', 'solid 1px red');

      spyOn(view.onMoved(), 'emit');

      view.css('border', 'solid 1px red');

      expect(view.onMoved().emit).not.toHaveBeenCalled();
    });

    it("should not emit an onMoved event if the border size doesn't change", function() {
      view.css('border', 'solid 1px red');

      spyOn(view.onMoved(), 'emit');

      view.css('border', 'solid 1px red');

      expect(view.onMoved().emit).not.toHaveBeenCalled();
    });
    
    it("should not emit an onMoved event on the superview.contentArea if the border size doesn't change", function() {
      fail
      return;
      
      view.css('border', 'solid 1px red');

      spyOn(view.onMoved(), 'emit');

      view.css('border', 'solid 1px red');

      expect(view.onMoved().emit).not.toHaveBeenCalled();
    });

    it("should change the position of the contentArea when setting a border", function() {
      fail
      // view.moveTo({width: 100, height: 100});
      // 
      //       view.css('border', 'solid 1px red');
      // 
      //       var cssSize = {
      //         width: parseInt(view.$().css('width')),
      //         height: parseInt(view.$().css('height'))
      //       }
      // 
      //       expect(cssSize).toEqualRect({
      //         width: 98,
      //         height: 98
      //       });
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
        expect(parseInt(view.css(setting))).not.toEqual(1234);

        view = new Superview;

        var css = {};
        css[setting] = 5678;
        view.css(css);
        expect(parseInt(view.css(setting))).not.toEqual(5678);
      });
    });

    it("should not filter allowed css settings", function() {

      allowedExamples.forEach(function (setting) {
        var view = new Superview;

        view.css(setting, 1234);
        expect(parseInt(view.css(setting))).toEqual(1234);

        view = new Superview;

        var css = {};
        css[setting] = 5678;
        view.css(css);
        expect(parseInt(view.css(setting))).toEqual(5678);
      });
    });
  })
})