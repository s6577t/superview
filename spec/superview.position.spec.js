xdescribe('superview.position', function () {
  
  var view;
  
  beforeEach(function() {
    view = new Superview;
  });
  
  xdescribe('moveTo() ? ', function () {
    it('should pass on the position to the dom element', function () {
      var v = new Superview();
      v.moveTo({top: 123, left: 456});
      expect(v.rect().top).toEqual(123);
      expect(v.rect().left).toEqual(456);
    });

    it('should emit an onMoved event with the view,rect,outerRect', function () {
      var v = new Superview();

      spyOn(v.onMoved(), 'emit').andCallThrough();

      var view, pos, outerPos;

      v.onMoved(function (a, b, c) {
        view = a;
        pos = b;
        outerPos = c;
      });  

      var p = {top: 123, left: 456};
      v.moveTo(p);

      expect(v.onMoved().emit).toHaveBeenCalled();
      expect(view).toBe(v);
      expect(pos).toBeInTheSamePositionAs(p);
      expect(outerPos).not.toBeNull();
    });

    it('should not emit an onMoved event if the position set is the same as the current position', function () {
      var v = new Superview();
      v.moveTo({top: 123, left: 456});

      spyOn(v.onMoved(), 'emit');
      v.moveTo({top: 123, left: 456});

      expect(v.onMoved().emit).not.toHaveBeenCalled();
    });

    it('should correctly set the position with disregard for border and padding', function () {
      var v = new Superview();

      v.$().css({
        borderWidth: 5,
        padding: 15
      });

      v.resize({width: 50, height: 60});
      v.moveTo({top: 200, left: 300});

      var rect = v.rect(),
          outer = v.outerRect();

      expect(rect.left).toEqual(300);
      expect(rect.top).toEqual(200);  
      expect(rect.right).toEqual(300+50);
      expect(rect.bottom).toEqual(200+60); 

      expect(outer.left).toEqual(300 - 20);
      expect(outer.top).toEqual(200-20);  
      expect(outer.right).toEqual(300+50+20);
      expect(outer.bottom).toEqual(200+60+20); 
    });

    it('should translate calls with right/bottom to calls with left/top', function () {
      var v = new Superview();

      v.$().css({
        borderWidth: 5,
        padding: 15
      });

      v.resize({width: 50, height: 60});
      v.moveTo({right: 200, bottom: 300});

      var rect = v.rect(),
          outer = v.outerRect();

      expect(rect.left).toEqual(200 - 50);
      expect(rect.top).toEqual(300 - 60);  
      expect(rect.right).toEqual(200);
      expect(rect.bottom).toEqual(300); 

      expect(outer.left).toEqual(200 - 50 - 20);
      expect(outer.top).toEqual(300 - 60 -20);  
      expect(outer.right).toEqual(200 + 20);
      expect(outer.bottom).toEqual(300 + 20); 
    });
  });

  xdescribe('outerMoveTo() ? ', function () {
    it('should move the element relative to the view area incl border and padding', function () {
      var v = new Superview();

      v.$().css({
        border: 'solid 3px black',
        padding: 17
      });

      v.outerMoveTo({top: 150, left: 200});
      v.outerResize({width: 400, height: 300});

      var rect = v.rect(), 
          outer = v.outerRect();

      expect(rect.top).toEqual(150 + 20);
      expect(rect.left).toEqual(200 + 20);
      expect(rect.right).toEqual(580);
      expect(rect.bottom).toEqual(430);

      expect(outer.top).toEqual(150);
      expect(outer.left).toEqual(200);
      expect(outer.right).toEqual(600);
      expect(outer.bottom).toEqual(450);
    });

    it('should translate right/bottom into left/top', function () {
      var v = new Superview();

      v.$().css({
        border: 'solid 3px black',
        padding: 17
      });

      v.outerResize({width: 350, height: 300});
      v.outerMoveTo({bottom: 650, right: 800});

      var rect = v.rect(), 
          outer = v.outerRect();

      expect(rect.top).toEqual(370);
      expect(rect.left).toEqual(470);
      expect(rect.right).toEqual(780);
      expect(rect.bottom).toEqual(630);

      expect(outer.top).toEqual(350);
      expect(outer.left).toEqual(450);
      expect(outer.right).toEqual(800);
      expect(outer.bottom).toEqual(650);
    });

    it('should pass on the call to moveTo', function () {
      var v = new Superview();
      spyOn(v, 'moveTo');
      v.outerMoveTo({left: 123, top: 456});
      expect(v.moveTo).toHaveBeenCalled();
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
      view.$().css({
        border: 'solid 5px red'
      });

      view.resize({width: 100, height: 50});
      view.moveTo({top: 10, left: 10});

      var r = v.position();
      
      expect(view.position()).toEqualRect({
        top: 10,
        right: 20 + 100,
        bottom: 20 + 50,
        left: 10
      })
    });
  });
})