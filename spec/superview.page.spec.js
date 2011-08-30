describe('superview.page', function () {
  var pg;
  beforeEach(function () {
    pg = new Superview.Page().render();
  })
  it('should have css class "page"', function () {
    expect(pg.z().hasClass('page')).toBe(true);
  });
  it('should be appended to the window', function () {
    spyOn(Superview.Window, 'add');
    var pg = new Superview.Page().render();
    expect(Superview.Window.add).toHaveBeenCalledWith(pg);
  })
  describe('fitting to the window', function () {
    it('should delegate to bindTo', function () {
      spyOn(pg, 'bindTo');
      pg.fitWindow();
      expect(pg.bindTo).toHaveBeenCalled();
    })
    it('should use a width and height binding to window', function () {
      pg.fitWindow();
      var binding = pg.binding();
      expect(binding.otherView).toBe(Superview.Window);
      expect(binding.width).toBe(true);
      expect(binding.height).toBe(true);
    })
  })
})