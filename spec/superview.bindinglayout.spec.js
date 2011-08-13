// view.bindTo(other, {
//   top: true|'top', 'bottom', function
// })
// 
// 
// 
// view.bindTo(view , function (bind) {
//   bind.top = function (other, otherRect, otherOuterRect) {
//     
//   }
// })

/*


view

other



view.bindTo(other, {
  width: true,
  height: function (otherRect, view, other) { return otherRect.height * 0.5 ;} (function in context of view),
  top: [true|top] | 'bottom' | '*3.2'(evalableexpress with) | function,
  left: SIMILAR to TOP
})

- shuold not bindTo() more than once with calling unbind() first
- calls unbind() if other emits onRemoved

view.unbind()
- if not bound returns ineffectual
- stop listeneing to onMove and onResize events on the bindTo(other) view and sets this._bindTo to null



*/