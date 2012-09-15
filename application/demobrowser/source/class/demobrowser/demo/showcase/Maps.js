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

/* ************************************************************************
#ignore(YMap)
#ignore(YAHOO_MAP_REG)
#ignore(google.maps)
#ignore(google.maps)
#ignore(google.maps.MapTypeId)
#ignore(google.maps.event)
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

      this.getRoot().add(this._createMapContainer("Yahoo Maps", yahooMap), {
        left : 20,
        top  : 20
      });
      this.getRoot().add(this._createMapContainer("Google Maps", googleMap), {
        left : 490,
        top  : 20
      });

    },

    _createMapContainer : function(title, map)
    {
      var comp = new qx.ui.container.Composite();
      comp.setLayout(new qx.ui.layout.VBox().set({spacing: 10}));
      comp.setWidth(450);
      comp.setHeight(400);

      var headline = new qx.ui.basic.Label("<b>" + title + "</b>").set({
        rich: true
      });
      comp.add(headline);
      comp.add(map);
      return comp;
    },

    _createYahooMap : function()
    {
      var isle = new qx.ui.core.Widget().set({
        width: 450,
        height: 400,
        decorator: "main"
      });

      isle.addListenerOnce("appear", function() {
        try {
          var map = new YMap(isle.getContentElement().getDomElement());
          map.addTypeControl();
          map.setMapType(YAHOO_MAP_REG);
          map.drawZoomAndCenter("Karlsruhe", 5);
        } catch(ex) {
          var msg;
          if (qx.core.Environment.get("engine.name") == "mshtml" &&
            qx.core.Environment.get("browser.documentmode") > 9) {
            msg = "IE 10 is not yet supported by Yahoo maps.";
          } else {
            msg = "Could not create Yahoo map!<br/>" + ex.toString();
          }
          this.getContentElement().getDomElement().innerHTML += msg;
        }
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
        try {
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
        } catch(ex) {
          var msg = "Could not create Google map!<br/>" + ex.toString();
          this.getContentElement().getDomElement().innerHTML += msg;
        }
      });
      return isle;
    }
  }
});
