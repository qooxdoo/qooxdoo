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

