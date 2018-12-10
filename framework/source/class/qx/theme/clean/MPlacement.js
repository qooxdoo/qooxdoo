/* ************************************************************************

   SQville Software

   http://sqville.com

   Copyright:
     None

   License:
     MIT

   Authors:
     * Chris Eskew (chris.eskew@sqville.com)

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
     * Get the size of the object to place. The callback will be called with
     * the size as first argument. This methods works asynchronously.
     *
     * The size of the object to place is the size of the widget. If a widget
     * including this mixin needs a different size it can implement the method
     * <code>_computePlacementSize</code>, which returns the size.
     *
     *  @param callback {Function} This function will be called with the size as
     *    first argument
     */
    _getPlacementSize : function(callback)
    {
      var size = null;

      if (this._computePlacementSize) {
        var size = this._computePlacementSize();
      } else if (this.isVisible()) {
        var size = this.getBounds();
      }

      if (size == null)
      {
        this.addListenerOnce("appear", function() {
          this._getPlacementSize(callback);
        }, this);
      } else {
        callback.call(this, size);
      }
    },

    
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
      this._getPlacementSize(function(size)
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
