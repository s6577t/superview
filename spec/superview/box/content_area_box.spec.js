/*
  these specs include those which apply to both boundary and content area boxes as well as specs specific to the content area box
*/

// describe('superview content area box', function () {
// 
//   describe('abstract box functionality', boxSpecs(function () {
//     return new Superview().contentArea();
//   }));
// 
//   describe("idiosyncratic functionality", function() {
// 
//     var view, contentArea;
// 
//     beforeEach(function () {
//       view = new Superview;
//       contentArea = view.contentArea();
//     })
// 
//     describe('superview.contentArea().size()', function () {
// 
//       it('should return the width and height excluding border', function () {
//         view.$().css({
//           border: 'solid 5px red'
//         });
// 
//         view.resize({width: 100, height: 200});
// 
//         expect(contentArea.size()).toEqualRect({width: 90, height: 190});
//       });
//     });
//   });
// })