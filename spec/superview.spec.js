describe('superview', function () {
  
  it("should assign unique ids", function () {
    var v1 = new View1, v2 = new View1, v3 = new View1;
  
    expect(v1.uid()).not.toEqual(v2.uid());    
    expect(v1.uid()).not.toEqual(v3.uid());    
    expect(v2.uid()).not.toEqual(v3.uid());    
  })  
  
  
  it("should have a hasViewMixin flag", function () {
    var v1 = new View1
    expect(v1.hasViewMixin).toBe(true);
  })
  
  it("return the set controller correctly", function () {
    var view = new Superview;
    var ctrlr = {};
    view.setController(ctrlr);
    
    expect(view.getController()).toBe(ctrlr);
  });
  
  describe("dom related behaviour", function () {
    it('returns a HTMLDivElement when calling elem()', function () {
      var v1 = new View1
      var e = v1.elem()
      expect(e).toBeInstanceOf(HTMLDivElement)
      expect(e.nodeName).toEqual('DIV')
    })
  
    it("can provide the jquery result of DOM building with the 'z' library", function () {
      expect(new View1().z()).toBeInstanceOf(jQuery);
    });
    
    it('should initialize its div container as position:absolute display:inline-block', function () {
      expect(new View1().z().css('position')).toEqual('absolute');
      expect(new View1().z().css('display')).toEqual('inline-block');
    })
  })
});

