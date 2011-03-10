/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

qx.Bootstrap.define("qx.bom.request.Xhr", 
{

  construct: function() {
    this._nxhr = new XMLHttpRequest();
  },

  statics :
  {
    OPENED: 1,
  },
  
  members :
  {
    /**
    * Native XmlHttpRequest or equivalent.
    */
    _nxhr: null,
    
    readyState: null,
    
    // Request metadata
    method: null,
    url: null,
    
    open: function(method, url) {
      var nxhr = this._nxhr;
      
      // Delegate
      this._nxhr.open(method, url);
      
      // Sync state
      this.readyState = nxhr.readyState;
    },
    
    _getNativeXhr: function() {
      return _nxhr;
    }
    
  }
});
