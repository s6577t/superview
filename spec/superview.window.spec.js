describe('superview.window', function () {
  var w;
  beforeEach(function() {
    w = Superview.Window;
  });
  afterEach(function () {
    w._uninstall();
  })
  
  describe('when installed', function () {
    beforeEach(function () {
      w.install();
    });
    it('should give its div css window class', function () {
      expect(w.$().hasClass('window')).toBe(true);
    });
    it('should give the body css class superview', function () {
      expect($('body').hasClass('superview')).toBe(true);
    });
    it('should anchor the outer dimension of body to the window size', function () {
      expect(w.$().outerWidth()).toBe($(window).width());
      expect(w.$().outerHeight()).toBe($(window).height());
    })
    it('should not have margin or padding', function () {
      ['top', 'bottom', 'right', 'left'].forEach(function (side) {
        ['padding', 'margin', 'border'].forEach(function (edging) {
          var v = parseFloat(w.$().css(edging + '-' + side) || 0);
          expect(v).toEqual(0);
        })
      })
    })
  });
  
  describe('not supported functions', function () {
    it('should raise an error on addTo()', function () {
      expect(function () {
        w.addTo(new Superview())
      }).toThrowAnError();
    });
    it('should raise an error on remove()', function () {
      expect(function () {
        w.remove()
      }).toThrowAnError();
    });
  });
});