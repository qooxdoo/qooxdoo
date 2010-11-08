/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (d_wagner)

************************************************************************ */

/**
 * Adds support for verification of infrastructure requirements to unit test
 * classes.
 */
qx.Mixin.define("testrunner2.unit.MRequirements", {
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members :
  {
    /**
     * Verifies a list of infrastructure requirements by checking for 
     * corresponding "has" methods. Throws RequirementErrors for unmet 
     * requirements.
     * 
     * @param featureList {String[]} List of infrastructure requirements
     */
    require : function(featureList) {
      for (var i=0,l=featureList.length; i<l; i++) {
        var feature = featureList[i];
        var hasMethodName = "has" + qx.lang.String.capitalize(feature);
        
        if (!this[hasMethodName]) {
          throw new Error('Unable to verify requirement: No method "' + hasMethodName + '" found');          
        }
        
        if (!this[hasMethodName]()) {
          throw new testrunner2.unit.RequirementError(feature);
        }
      }
    },
    
    /**
     * Checks if the test application has been loaded over HTTPS.
     * 
     * @return {Boolean} Whether SSL is currently used
     */
    hasSsl : function()
    {
      return qx.bom.client.Feature.SSL;
    },
    
    /**
     * Checks if the test location has been loaded from a web server.
     */
    hasHttp : function()
    {
      return document.location.protocol.indexOf("http") == 0;
    }
  }
  
});