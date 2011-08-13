/* doesn't ACTUALLY test superview.rect.js but instead the methods that use it ;) */

describe('getting/setting the size of an element', function () {
  it('should pass on the dimensions to the dom element', function () {
    var v = new Superview();
    v.setSize({width: 123, height: 456});
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
    v.setSize(s);
    
    expect(v.onResized().emit).toHaveBeenCalled();
    expect(view).toBe(v);
    expect(Superview.Rect.areEqual(size, s)).toBeTruthy();
  });
  
  it('should not emit an onResized event if the size set is the same as the current size', function () {
    var v = new Superview();
    v.setSize({width: 123, height: 456});
    
    spyOn(v.onResized(), 'emit');
    v.setSize({width: 123, height: 456});
    
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
    v.setOuterSize(s);
    
    expect(v.getRect().width).toEqual(83);
    expect(v.getRect().height).toEqual(416);
  });
  
  it('should retrieve the size inclusive of border and padding', function () {
    var v = new Superview();
    v.setOuterSize({width: 123, height: 456});
    expect(v.z().outerWidth()).toEqual(123);
    expect(v.z().outerHeight()).toEqual(456);
  });
  
  it('should pass on the call to setSize', function () {
    var v = new Superview();
    spyOn(v, 'setSize');
    v.setOuterSize({width: 123, height: 456});
    expect(v.setSize).toHaveBeenCalled();
  });
});

describe('getting/setting the inner position of an element', function () {
  it('should pass on the position to the dom element', function () {
    var v = new Superview();
    v.moveTo({top: 123, left: 456});
    expect(v.getRect().top).toEqual(123);
    expect(v.getRect().left).toEqual(456);
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
});

describe('moving the outer positon of an element (moveOuterTo())', function () {
  it('should move the element relative to the view area incl border and padding', function () {
    var v = new Superview();
    v.z().css({
      border: 'solid 10px black',
      padding: 10
    });
    v.moveOuterTo({top: 123, left: 456});
    
    var rect = v.getRect(), outer = v.getOuterRect();
    
    expect(rect.top).toEqual(143);
    expect(outer.top).toEqual(123);
    
    expect(rect.left).toEqual(476);
    expect(outer.left).toEqual(456);
  });
  
  it('should pass on the call to moveTo', function () {
    var v = new Superview();
    spyOn(v, 'moveTo');
    v.moveOuterTo({left: 123, top: 456});
    expect(v.moveTo).toHaveBeenCalled();
  });
});

describe('getRect()', function () {
  it('should returns the width, height top and left of the element excluding border and padding', function () {
    var v = new Superview();
    v.setSize({width: 123, height: 456});
    v.moveTo({top: 45, left: 101});
    var r = v.getRect();
    
    expect(r.width).toEqual(123);
    expect(r.height).toEqual(456);
    expect(r.top).toEqual(45);
    expect(r.left).toEqual(101);
    expect(r.right).toEqual(101+123);
    expect(r.bottom).toEqual(45+456);
  });
});

describe('getOuterRect()', function () {
  it('should returns the width, height top and left of the element including border and padding', function () {
    var v = new Superview();
    v.setOuterSize({width: 123, height: 456});
    v.moveOuterTo({top: 45, left: 101});
    var r = v.getOuterRect();
    
    expect(r.width).toEqual(123);
    expect(r.height).toEqual(456);
    expect(r.top).toEqual(45);
    expect(r.left).toEqual(101);
    expect(r.right).toEqual(101+123);
    expect(r.bottom).toEqual(45+456);
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

- .setSize({width: w, height: h})
  - sets the css width and height of the container element
  - emits a resized event with (sourceView, dimensions)
  .setOuterSize({width:w, height:h})
  - set the size including the padding and border
  
- .getRect()
  - gets the left, top, width and height of the element


*/