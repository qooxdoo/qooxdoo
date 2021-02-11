/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 OETIKER+PARTNER AG

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tobias Oetiker (oetiker)

************************************************************************ */
/**
 * Mixin responsible for setting the css transition properties of a widget
 * This mixin is usually used by {@link qx.ui.decoration.Decorator}.
 *
 * Keep in mind that this is not supported by all browsers:
 *
 * * Firefox 16+
 * * IE 10+
 * * Edge
 * * Safari 6.1+
 * * Opera 12.10+
 * * Chrome 26+
 *
 * It is possible to define transitions by setting an
 * array containing the needed values as the property value.
 * In case multiple values are specified, the values of the properties
 * are repeated until all match in length.
 *
 * An example:
 * <pre class="javascript">
 *   'my-decorator': {
 *     style: {
 *       transitionProperty: ['top','left']
 *       transitionDuration: '1s'
 *     }
 *   }
 * </pre>
 */
qx.Mixin.define("qx.ui.decoration.MTransition",
{
  properties :
  {
    /** transition property */
    transitionProperty :
    {
      nullable : true,
      apply : "_applyTransition"
    },
    /** transition duration */
    transitionDuration :
    {
      nullable : true,
      apply : "_applyTransition"
    },
    /** transition delay */
    transitionTimingFunction :
    {
      nullable : true,
      apply : "_applyTransition"
    },
    /** transition delay */
    transitionDelay :
    {
      nullable : true,
      apply : "_applyTransition"
    }
  },


  members :
  {

    /**
     * Takes a styles map and adds the box shadow styles in place to the
     * given map. This is the needed behavior for
     * {@link qx.ui.decoration.Decorator}.
     *
     * @param styles {Map} A map to add the styles.
     */
    _styleTransition: function(styles) {
      var propName = qx.core.Environment.get("css.transition");
      if (!propName ||
          this.getTransitionDuration() == null ){
        return;
      }
      if (qx.bom.client.Browser.getName() === "chrome" && qx.bom.client.Browser.getVersion() >= 71) {
        // chrome has a repaint problem ... as suggested in
        // https://stackoverflow.com/a/21947628/235990 we are setting
        // a transform ...
        if (!styles.transform) {
          styles.transform = "translateZ(0)";
        }
      }

      propName = qx.bom.Style.getCssName(propName.name);

      var transitionProperties = ["transitionProperty","transitionDuration","transitionTimingFunction","transitionDelay"];

      (function(tPros, tDurs, tTims, tDels) {
        for(var i=0;i<tPros.length;i++) {
          var tPro = tPros[i] || 'all';
          var tDur = tDurs[i] || '0s';
          var tTim = tTims[i] || 'ease';
          var tDel = tDels[i] || '0s';

          var value = tPro + ' ' + tDur + ' ' + tTim + ' ' + tDel;
          if (!styles[propName]) {
            styles[propName] = value;
          } else {
            styles[propName] += "," + value;
          }
        }
      }).apply(this, this._getExtendedPropertyValueArrays(transitionProperties));
    },

    // property apply
    _applyTransition : function()
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (this._isInitialized()) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
      }
    }
  }
});
