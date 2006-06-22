package qooxdoo;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import net.sf.qooxdoo.rpc.RemoteService;
import net.sf.qooxdoo.rpc.RemoteServiceException;

public class test implements RemoteService {

    public String echo(String input) throws RemoteServiceException {
        return "Client said: " + input;
    }

    public String sleep(String seconds) throws RemoteServiceException {
        try {
            Thread.sleep(Integer.parseInt(seconds)*1000);
        } catch (InterruptedException e) {
            // ignore
        }
        return seconds;
    }

    public Map getCurrentTimestamp() throws RemoteServiceException {
        Map retVal = new HashMap();
        retVal.put("now", new Long(System.currentTimeMillis()));
        retVal.put("json", new Date());
        return retVal;
    }
    
    public int getInteger() throws RemoteServiceException {
        return 1;
    }
    
    public boolean isInteger(int param) throws RemoteServiceException {
        return true;    // if we get here, we are guaranteed to have
                        // an integer
    }
    
    public String getString() throws RemoteServiceException {
        return "Hello world";
    }
    
    public boolean isString(String param) throws RemoteServiceException {
        return (param != null);
    }
    
    public Object getNull() throws RemoteServiceException {
        return null;
    }
    
    public boolean isNull(Object param) throws RemoteServiceException {
        return (param == null);
    }
    
    public int[] getArrayInteger() throws RemoteServiceException {
        return new int[] {1, 2, 3, 4};
    }
    
    public String[] getArrayString() throws RemoteServiceException {
        return new String[] {"one", "two", "three", "four"};
    }
    
    public boolean isArray(Object[] array) throws RemoteServiceException {
        return true;    // if we get here, we are guaranteed to have an
                        // array
    }
    
    public double getFloat() throws RemoteServiceException {
        return 1.0/3;
    }
 
    public boolean isFloat(double param) throws RemoteServiceException {
        return true;
    }
    
    public boolean getTrue() throws RemoteServiceException {
        return true;
    }
    
    public boolean getFalse() throws RemoteServiceException {
        return false;
    }
    
    public boolean isBoolean(boolean param) throws RemoteServiceException {
        return true;
    }
    
    public Object getParam(Object param) throws RemoteServiceException {
        return param;
    }
    
    public Object[] getParams(Object param1, Object param2, Object param3,
                              Object param4, Object param5, Object param6,
                              Object param7, Object param8)
        throws RemoteServiceException {
        
        return new Object[] {param1, param2, param3, param4, param5, param6,
                             param7, param8};
    }
    
    public Object[] getParams(Object param1) throws RemoteServiceException {
        return new Object[] {param1};
    }
    
    public Object[] getParams(Object param1, Object param2) throws RemoteServiceException {
        return new Object[] {param1, param2};
    }
    
    public void getError() throws RemoteServiceException {
        // TODO: throw the same error as the PHP implementation
        throw new RemoteServiceException("Demo error");
    }
    
    public Object getObject() throws RemoteServiceException {
        return new Object();    // an arbitrary object
    }

    public boolean isObject(Object param) throws RemoteServiceException {
        return (param != null);
    }
    
}
