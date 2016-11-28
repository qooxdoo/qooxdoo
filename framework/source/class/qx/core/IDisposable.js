/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2016 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman (john.spackman@zenesis.com)

************************************************************************ */

/**
 * Classes which implement this interface are required to be disposed when they are
 * no longer needed, by calling .dispose(); they are also registered with qx.core.ObjectRegistry
 * so that qx.core.ObjectRegistry.fromHashCode() will work.
 * 
 * Note that classes do not have to implement this interface in order to provide a dispose
 * method and/or a destructor. 
 */
qx.Interface.define("qx.core.IDisposable", {
	
	members: {
    /**
     * Dispose this object
     *
     */
		dispose: function() {
			
		}
	}
});