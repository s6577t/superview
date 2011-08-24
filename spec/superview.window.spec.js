describe('superview.window', function () {
  var w;
  beforeEach(function() {
    w = Superview.Window;
  });
  afterEach(function () {
    w.uninstall();
  })
  
  describe('when installed', function () {
    beforeEach(function () {
      w.install();
    });
    it('should give its div css window class', function () {
      expect(w.z().hasClass('window')).toBe(true);
    });
    it('should give the body css class superview', function () {
      expect($('body').hasClass('superview')).toBe(true);
    });
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
  
  describe('when installed', function () {
    beforeEach(function () {
      w.install()
    })
    it('should bind the outer dimension of body to the window size', function () {
      expect(w.z().outerWidth()).toBe($(window).width());
      expect(w.z().outerHeight()).toBe($(window).height());
    })
    it('should not have margin or padding', function () {
      ['top', 'bottom', 'right', 'left'].forEach(function (side) {
        ['padding', 'margin', 'border'].forEach(function (edging) {
          var v = parseFloat(w.z().css(edging + '-' + side) || 0);
          expect(v).toEqual(0);
        })
      })
    })
  });
});