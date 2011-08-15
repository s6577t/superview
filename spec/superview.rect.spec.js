/* doesn't ACTUALLY test superview.rect.js but instead the methods that use it ;) */

describe('getting/setting the size of an element', function () {
  it('should pass on the dimensions to the dom element', function () {
    var v = new Superview();
    v.resize({width: 123, height: 456});
    expect(v.z().width()).toEqual(123);
    expect(v.z().height()).toEqual(456);
  });
  
  it('should emit an onResized event with the view,rect,outerRect', function () {
    var v = new Superview();
    
    spyOn(v.onResized(), 'emit').andCallThrough();
    
    var view, size, outerSize;
    
    v.onResized(function (a, b, c) {
      view = a;
      size = b;
      outerSize = c;
    });
    
    var s = {width: 123, height: 456};
    v.resize(s);
    
    expect(v.onResized().emit).toHaveBeenCalled();
    expect(view).toBe(v);
    expect(Superview.Rect.areEqual(size, s)).toBeTruthy();
  });
  
  it('should not emit an onResized event if the size set is the same as the current size', function () {
    var v = new Superview();
    v.resize({width: 123, height: 456});
    
    spyOn(v.onResized(), 'emit');
    v.resize({width: 123, height: 456});
    
    expect(v.onResized().emit).not.toHaveBeenCalled();
  });
});

describe('getting/setting the outer size of the element', function () {
  it('should set the size inclusive of padding and border', function () {
    
    var v = new Superview();
    v.z().css({
      border: 'solid 10px black',
      padding: 10
    });
    
    var s = {width: 123, height: 456};
    v.outerResize(s);
    
    expect(v.rect().width).toEqual(83);
    expect(v.rect().height).toEqual(416);
  });
  
  it('should retrieve the size inclusive of border and padding', function () {
    var v = new Superview();
    v.outerResize({width: 123, height: 456});
    expect(v.z().outerWidth()).toEqual(123);
    expect(v.z().outerHeight()).toEqual(456);
  });
  
  it('should pass on the call to resize', function () {
    var v = new Superview();
    spyOn(v, 'resize');
    v.outerResize({width: 123, height: 456});
    expect(v.resize).toHaveBeenCalled();
  });
});

describe('moving the inner position of an element', function () {
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
    expect(Superview.Rect.areEqual(pos, p)).toBeTruthy();
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
    
    v.z().css({
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
    
    v.z().css({
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

describe('moving the outer positon of an element (outerMoveTo())', function () {
  it('should move the element relative to the view area incl border and padding', function () {
    var v = new Superview();
    
    v.z().css({
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
    
    v.z().css({
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

describe('rect()', function () {
  it('should be all zero on a new view', function () {
    var v = new Superview();
    var r = v.rect()
    "top,left,bottom,right,width,height".split(",").forEach(function(m) {
      expect(r[m]).toEqual(0);
    })
  });
  
  it('should returns the width, height top and left of the element excluding border and padding', function () {
    var v = new Superview();
    
    v.z().css({
      border: 'solid 15px red',
      padding: 5
    });
    
    v.resize({width: 123, height: 456});
    v.moveTo({top: 45, left: 101});
    
    var r = v.rect();
    
    expect(r.width).toEqual(123);
    expect(r.height).toEqual(456);
    expect(r.top).toEqual(45);
    expect(r.left).toEqual(101);
    expect(r.right).toEqual(101+123);
    expect(r.bottom).toEqual(45+456);
  });
});

describe('outerRect()', function () {
  it('should returns the width, height top and left of the element including border and padding', function () {
    var v = new Superview();
    
    v.z().css({
      border: 'solid 15px red',
      padding: 5
    }); 
       
    v.resize({width: 123, height: 456});
    v.moveTo({top: 45, left: 101});
    var r = v.outerRect();
    
    expect(r.top).toEqual(45 - 20);
    expect(r.left).toEqual(101 - 20);
    expect(r.right).toEqual(101 + 123 + 20);
    expect(r.bottom).toEqual(45 + 456 + 20);
    expect(r.width).toEqual(123 + 20 + 20);
    expect(r.height).toEqual(456 + 20 + 20);
  });
});

describe('paddingMetrics()', function () {
  
  var v;
  
  beforeEach(function () {
    v = new Superview();
    v.z().css({
      paddingTop: 1,
      paddingBottom: 2,
      paddingLeft: 3,
      paddingRight: 4
    });
  });
  
  it('top should return top', function () {
    expect(v.paddingMetrics().top).toEqual(1);
  });
  it('left should return left', function () {
    expect(v.paddingMetrics().left).toEqual(3);
  });
  it('bottom should return bottom', function () {
    expect(v.paddingMetrics().bottom).toEqual(2);
  });
  it('right should return right', function () {
    expect(v.paddingMetrics().right).toEqual(4);
  });
  it('width should return left+right', function () {
    expect(v.paddingMetrics().width).toEqual(7);
  });
  it('height should return top+bottom', function () {
    expect(v.paddingMetrics().height).toEqual(3);
  });
})

describe('borderMetrics()', function () {
  var v;
  
  beforeEach(function () {
    v = new Superview();
    v.z().css({
      borderTop: 1,
      borderBottom: 2,
      borderLeft: 3,
      borderRight: 4
    });
  });
  
  it('top should return top', function () {
    expect(v.borderMetrics().top).toEqual(1);
  });
  it('left should return left', function () {
    expect(v.borderMetrics().left).toEqual(3);
  });
  it('bottom should return bottom', function () {
    expect(v.borderMetrics().bottom).toEqual(2);
  });
  it('right should return right', function () {
    expect(v.borderMetrics().right).toEqual(4);
  });
  it('width should return left+right', function () {
    expect(v.borderMetrics().width).toEqual(7);
  });
  it('height should return top+bottom', function () {
    expect(v.borderMetrics().height).toEqual(3);
  });
})

/*
- .moveTo({left:left, top:top})
  - sets the css on the dom element
  - emits and event with (sourceView, position) // position is left,top
  - css position should be absolute

- .resize({width: w, height: h})
  - sets the css width and height of the container element
  - emits a resized event with (sourceView, dimensions)
  .outerResize({width:w, height:h})
  - set the size including the padding and border
  
- .rect()
  - gets the left, top, width and height of the element


*/