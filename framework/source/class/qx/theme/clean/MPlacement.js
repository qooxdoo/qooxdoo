/* ************************************************************************

   Copyright:

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * 

************************************************************************ */

/**
 * Methods to place popup like widgets to other widgets, points,
 * pointer event coordinates, etc.
 */
qx.Mixin.define("qx.theme.clean.MPlacement",
{

  members :
  {
    /**
     * Override
     * 
     * Internal method to read specific this properties and
     * apply the results to the this afterwards.
     *
     * @param coords {Map} Location of the object to align the this to. This map
     *   should have the keys <code>left</code>, <code>top</code>, <code>right</code>
     *   and <code>bottom</code>.
     */
    _place : function(coords)
    {
      this.__getPlacementSize(function(size)
      {
        var result = qx.util.placement.Placement.compute(
          size,
          this.getLayoutParent().getBounds(),
          coords,
          this._getPlacementOffsets(),
          this.getPosition(),
          this.getPlacementModeX(),
          this.getPlacementModeY()
        );

        // state handling for tooltips e.g.
        this.removeState("placementLeft");
        this.removeState("placementRight");
        this.removeState("placementBottom");
        this.removeState("placementTop");
        this.addState(coords.left < result.left ? "placementRight" : "placementLeft");

        this.addState(coords.top < result.top ? "placementBottom" : "placementTop");

        this.moveTo(result.left, result.top);
      });
    }
  }

});
