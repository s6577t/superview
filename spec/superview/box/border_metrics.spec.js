describe('superview.borderMetrics()', function () {

  var view;

  beforeEach(function () {
    view = new Superview
  })

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
});