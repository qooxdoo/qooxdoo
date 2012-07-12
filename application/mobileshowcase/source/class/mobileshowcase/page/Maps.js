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

************************************************************************ */

/**
 * Mobile page showing a OpenStreetMap map.
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
  },
  

  members :
  {
    _mapUri: "http://www.openlayers.org/api/OpenLayers.js",
    _map : null,
    _markers : null,
    _myPositionMarker : null,
    
    // overridden
    _initialize : function()
    {
      this.base(arguments);
      this._initGeoLocation();
      this._loadMapLibrary();
    },
    
    /**
     * Prepares GeoLocation, and installs needed listeners.
     */
    _initGeoLocation : function() {
      var geo = qx.bom.GeoLocation.getInstance();
      var self = this;
      geo.addListener("position", function(position) {
        var latitude = position.getLatitude();
        var longitude = position.getLongitude();
        
        var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
        var toProjection = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
        var mapPosition = new OpenLayers.LonLat(longitude,latitude).transform( fromProjection, toProjection);
        var zoom = 15; 
 
        self._map.setCenter(mapPosition, zoom );
        self._setMarkerOnMap(self._map,mapPosition);
      })
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
       var descriptionLabel = new qx.ui.mobile.basic.Label("Fullscreen");
       descriptionLabel.addCssClass("osmMapLabel");
       
       // TOGGLE BUTTON
       var toggleNaviButton = new qx.ui.mobile.form.ToggleButton(false);
       
       // SHOW MY POSITION BUTTON
       var showMyPositionButton = new qx.ui.mobile.form.Button("Find me!");
       showMyPositionButton.addListener("tap", this._getGeoPosition, this);
       
       toggleNaviButton.addListener("changeValue", function() {
        var newNavBarState = !this.isNavigationBarHidden();
        this.setNavigationBarHidden(newNavBarState);
        this.show();
       },this);
       
       var group1 = new qx.ui.mobile.form.Group([showMyPositionButton],false);
       var group2 = new qx.ui.mobile.form.Group([descriptionLabel,toggleNaviButton],true);
       
       showMyPositionButton.addCssClass("map-shadow");
       group2.addCssClass("map-shadow");
       
       menuContainer.add(group1);
       menuContainer.add(group2);
       
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
        var mapnik = new OpenLayers.Layer.OSM("mapnik",null,{});
        
        self._map.addLayer(mapnik);
        self._getGeoPosition();
      }
      
      req.open("GET", this._mapUri);
      req.send();
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
      this._disposeObjects("_mapUri","_map","_myPositionMarker","_markers");
    }
  }
});