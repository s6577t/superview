xdescribe('Superview.Page', function () {
  var pg;
  beforeEach(function () {
    pg = new Superview.Page().initialize();
  })
  it('should have css class "page"', function () {
    expect(pg.$().hasClass('page')).toBe(true);
  });
  it('should be appended to the window', function () {
    spyOn(Superview.Window, 'add').andCallThrough();
    var pg = new Superview.Page().initialize();
    expect(Superview.Window.add).toHaveBeenCalledWith(pg);
  })
  describe('fitting to the window', function () {
    it('should delegate to anchorTo', function () {
      spyOn(pg, 'anchorTo');
      pg.fitWindow();
      expect(pg.anchorTo).toHaveBeenCalled();
    })
    it('should use a width and height anchoring to window', function () {
      pg.fitWindow();
      var anchoring = pg.anchoring();
      expect(anchoring.otherView).toBe(Superview.Window);
      expect(anchoring.width).toBe(true);
      expect(anchoring.height).toBe(true);
    })
  })
})