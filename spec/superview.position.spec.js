describe('superview.position', function () {
  
  var view;
  
  beforeEach(function() {
    view = new Superview;
  });
  
  describe('moveTo()', function () {
    it('should pass on the position to the dom element', function () {
      view.moveTo({top: 123, left: 456});
      
      expect(parseInt(view.$().css('top'))).toEqual(123);
      expect(parseInt(view.$().css('left'))).toEqual(456);
      
      expect(view.$().position()).toEqualRect({
        top: 123,
        left: 456
      });
    });

    it('should emit an onMoved event with the view', function () {
      spyOn(view.onMoved(), 'emit').andCallThrough();

      var v;

      view.onMoved(function (a) {
        v = a;
      });  

      var p = {top: 123, left: 456};
      view.moveTo(p);

      expect(view.onMoved().emit).toHaveBeenCalled();
      expect(v).toBe(view);
      expect(view.position()).toEqualRect(p);
    });

    it('should not emit an onMoved event if the position set is the same as the current position', function () {
      view.moveTo({top: 123, left: 456});

      spyOn(view.onMoved(), 'emit');
      view.moveTo({top: 123, left: 456});

      expect(view.onMoved().emit).not.toHaveBeenCalled();
    });

    it('should translate calls with right/bottom to calls with left/top', function () {
      view.resize({width: 50, height: 60});
      view.moveTo({right: 200, bottom: 300});

      var position = view.position();
          
      expect(position).toEqualRect({
        top: 240,
        right: 200,
        bottom: 300,
        left: 150
      });
    });
  });

  describe('position()', function () {
    it('should be all zero on a new view', function () {
      expect(view.position()).toEqualRect({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      })
    });

    it('should returns the top-left-right-bottom of the view', function () {
      view.resize({width: 100, height: 50});
      view.moveTo({top: 10, left: 10});

      expect(view.position()).toEqualRect({
        top: 10,
        right: 110,
        bottom: 60,
        left: 10
      })
    });
  });
})