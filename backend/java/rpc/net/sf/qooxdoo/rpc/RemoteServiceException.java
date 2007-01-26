/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006-2007 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Andreas Junghans (lucidcake)

************************************************************************ */

package net.sf.qooxdoo.rpc;


/**
 * An exception for remotely callable methods.
 * If a method declares that it throws this exception, it's assumed that it's
 * OK to call this method from JavaScript code.
 */

public class RemoteServiceException extends Exception {


    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;


	/**
     * Contructs a new instance.
     */

    public RemoteServiceException() {
        super();
    }


    /**
     * Constructs a new instance.
     */

    public RemoteServiceException(String msg) {
        super(msg);
    }

    
    /**
     * Constructs a new instance.
     */

    public RemoteServiceException(Throwable cause) {
        super(cause);
    }

    
    /**
     * Constructs a new instance.
     */

    public RemoteServiceException(String msg, Throwable cause) {
        super(msg, cause);
    }

}

