/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/*
 * If you have added resources to your app remove the leading '*' in the
 * following line to make use of them.

#asset(qx/mobile/css/*)
#ignore(OpenLayers)
#ignore(OpenLayers.Layer)

************************************************************************ */

/**
 * Mobile page showing a OpenStreetMap map.
 *
 * @ignore(OpenLayers)
 */
qx.Class.define("mobileshowcase.page.Maps",
{
  extend : qx.ui.mobile.page.NavigationPage,

  construct : function()
  {
    this.base(arguments,false);
    this.setTitle("Maps");
    this.setShowBackButton(true);
    this.setBackButtonText("Back");

    this._geolocationEnabled = qx.core.Environment.get("html.geolocation");
  },


  members :
  {
    _mapUri: "http://www.openlayers.org/api/OpenLayers.js",
    _map : null,
    _markers : null,
    _myPositionMarker : null,
    _mapnikLayer : null,
    _geolocationEnabled : false,
    _showMyPositionButton : null,


    // overridden
    _initialize : function()
    {
      this.base(arguments);

      if(this._geolocationEnabled) {
        this._initGeoLocation();
      }

      this._loadMapLibrary();

      // Listens on window orientation change, and triggers redraw of map.
      // Needed for triggering OpenLayers to use a bigger area, and draw more tiles.
      qx.event.Registration.addListener(window, "orientationchange", this._redrawMap, this);
    },


    /**
     * Used the Mapnik Layer for redrawing. Needed after orientationChange event
     * and drawing markers.
     */
    _redrawMap : function () {
      if(this._mapnikLayer!= null){
        this._mapnikLayer.redraw();
      }
    },


    /**
     * Prepares GeoLocation, and installs needed listeners.
     */
    _initGeoLocation : function() {
      var geo = qx.bom.GeoLocation.getInstance();
      geo.addListener("position", this._onGeolocationSuccess,this)
      geo.addListener("error", this._onGeolocationError,this);
    },


    /**
     * Callback function when Geolocation did work.
     */
    _onGeolocationSuccess : function(position) {
      var latitude = position.getLatitude();
      var longitude = position.getLongitude();

      var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
      var toProjection = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
      var mapPosition = new OpenLayers.LonLat(longitude,latitude).transform( fromProjection, toProjection);
      var zoom = 15;

      this._map.setCenter(mapPosition, zoom);
      this._setMarkerOnMap(this._map,mapPosition);

      this._redrawMap();
    },


    /**
     * Callback function when Geolocation returned an error.
     */
    _onGeolocationError : function() {
      this._showMyPositionButton.setEnabled(false);

      var buttons = [];
      buttons.push(qx.locale.Manager.tr("OK"));
      var title = "Problem with Geolocation";
      var text = "Please activate location services on your browser and device."
      qx.ui.mobile.dialog.Manager.getInstance().confirm(title, text, function() {
      }, this, buttons);
    },


    /**
     * Retreives GeoPosition out of qx.bom.Geolocation and zooms to this point on map.
     */
    _getGeoPosition : function() {
      var geo = qx.bom.GeoLocation.getInstance();
      geo.getCurrentPosition(false, 1000, 1000);
    },


    // overridden
    _createScrollContainer : function()
    {
      // MapContainer
      var layout = new qx.ui.mobile.layout.VBox().set({
        alignX : "center",
        alignY : "middle"
      });

      var mapContainer = new qx.ui.mobile.container.Composite(layout);

      mapContainer.setId("osmMap");
      return mapContainer;
    },


    // overridden
    _createContent : function() {
       var menuContainer = new qx.ui.mobile.container.Composite();
       menuContainer.setId("mapMenu");

       // LABEL
       var descriptionLabel = new qx.ui.mobile.basic.Label("Page Title");
       descriptionLabel.addCssClass("osmMapLabel");

       // TOGGLE BUTTON
       var toggleNaviButton = new qx.ui.mobile.form.ToggleButton(true,"Show","Hide",12);

       // SHOW MY POSITION BUTTON
       this._showMyPositionButton = new qx.ui.mobile.form.Button("Find me!");
       this._showMyPositionButton.addListener("tap", this._getGeoPosition, this);

       // Button is disabled, when Geolocation is not possible.
       this._showMyPositionButton.setEnabled(this._geolocationEnabled);

       toggleNaviButton.addListener("changeValue", function() {
        var newNavBarState = !this.isNavigationBarHidden();
        this.setNavigationBarHidden(newNavBarState);
        this.show();
       },this);

       var groupPosition = new qx.ui.mobile.form.Group([this._showMyPositionButton],false);
       var groupFullScreen = new qx.ui.mobile.form.Group([descriptionLabel,toggleNaviButton],true);

       this._showMyPositionButton.addCssClass("map-shadow");
       groupFullScreen.addCssClass("map-shadow");

       menuContainer.add(groupFullScreen);
       menuContainer.add(groupPosition);

       return menuContainer;
    },


    /**
     * Loads JavaScript library which is needed for the map.
     */
    _loadMapLibrary : function() {

      var self = this;
      var req = new qx.bom.request.Script();

      req.onload = function() {
        self._map = new OpenLayers.Map("osmMap");
        self._mapnikLayer = new OpenLayers.Layer.OSM("mapnik",null,{});

        self._map.addLayer(self._mapnikLayer);

        self._zoomMapToDefaultPosition();
      }

      req.open("GET", this._mapUri);
      req.send();
    },


    /**
     * Zooms the map to a default position.
     * In this case: Berlin, Germany.
     */
    _zoomMapToDefaultPosition : function() {
      var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
      var toProjection = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
      var mapPosition = new OpenLayers.LonLat(13.41,52.52).transform( fromProjection, toProjection);
      var zoom = 15;

      this._map.setCenter(mapPosition, zoom);
    },


    /**
     * Draws a Marker on the map.
     */
    _setMarkerOnMap : function(map,mapPosition) {
      if(this._markers==null) {
        this._markers = new OpenLayers.Layer.Markers( "Markers" );
        map.addLayer(this._markers);
      }

      if(this._myPositionMarker != null) {
        this._markers.removeMarker(this._myPositionMarker);
      }

      this._myPositionMarker = new OpenLayers.Marker(mapPosition,icon);

      var size = new OpenLayers.Size(21,25);
      var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
      var icon = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png', size, offset);

      this._markers.addMarker(this._myPositionMarker);
    },


    // overridden
    _back : function()
    {
      qx.core.Init.getApplication().getRouting().executeGet("/", {reverse:true});
    },


    /*
    *****************************************************************************
      DESTRUCTOR
    *****************************************************************************
    */
    destruct : function()
    {
      this._disposeObjects("_mapUri","_map","_myPositionMarker","_markers","_showMyPositionButton","_mapnikLayer");
    }
  }
});
