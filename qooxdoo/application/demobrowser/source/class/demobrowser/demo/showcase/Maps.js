/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Adrian Olaru (adrianolaru)

************************************************************************ */

/**
 * @tag showcase
 * @lint ignoreUndefined(google, YMap, YAHOO_MAP_REG)
 */
qx.Class.define("demobrowser.demo.showcase.Maps",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);
      var yahooMap = this._createYahooMap();
      var googleMap = this._createGoogleMap();

      this.getRoot().add(this._createWindow("Yahoo Maps", yahooMap),{
        left : 10,
        top  : 10
      });
      this.getRoot().add(this._createWindow("Google Maps", googleMap),{
        left : 100,
        top  : 100
      });

    },

    _createWindow : function(title, map)
    {
      var win = new qx.ui.window.Window(title);
      win.setLayout(new qx.ui.layout.VBox);
      win.setMaxWidth(450);
      win.setMaxHeight(400);
      win.setMinWidth(450);
      win.setMinHeight(400);
      win.setAllowMaximize(false);
      win.setContentPadding(0);
      win.add(map);
      win.open();
      return win;
    },

    _createYahooMap : function()
    {
      var isle = new qx.ui.core.Widget().set({
        width: 450,
        height: 400
      });

      isle.addListenerOnce("appear", function() {
        var map = new YMap(isle.getContentElement().getDomElement());
        map.addTypeControl();
        map.setMapType(YAHOO_MAP_REG);
        map.drawZoomAndCenter("Karlsruhe", 5);      
      });
      return isle;
    },

    _createGoogleMap : function()
    {
      var isle = new qx.ui.core.Widget().set({
        width: 450,
        height: 400
      });
      
      // Since the decorator requires a bit of extra code, we set
      // an decorator for demonstration purpose here. Of course,
      // you may not need a decorator.
      isle.setDecorator("main");
     
      isle.addListenerOnce("appear", function() {
        var map = new google.maps.Map(isle.getContentElement().getDomElement(), {
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });
        
        // Fix for [BUG #4178]
        // Make sure zIndex of map element is higher than zIndex of decorator
        // (Maps apparently resets zIndex on init)
        google.maps.event.addListenerOnce(map, "center_changed", function() {
          // Wait for DOM
          window.setTimeout(function() {
            var zIndex = isle.getContentElement().getStyle('zIndex');
            isle.getContentElement().getDomElement().style.zIndex = zIndex;
          }, 500);
        });
        
        map.setCenter(new google.maps.LatLng(49.011899,8.403311));
      });
      return isle;
    }
  }
});
