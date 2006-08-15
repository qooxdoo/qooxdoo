package net.sf.qooxdoo.rpc;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.Writer;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;


import org.apache.commons.beanutils.ConvertUtils;
import org.apache.commons.beanutils.MethodUtils;
import org.apache.commons.beanutils.PropertyUtils;
import org.json.JSONArray;
import org.json.JSONObject;

public class RpcServlet extends HttpServlet {

    /** The size for the read buffer. */
    private static final int BUFFER_SIZE = 8192;
   
    
    /**
     * Version UID. 
     */
    
    private static final long serialVersionUID = 1L;
    

    /**
     * Stores the current request as a ThreadLocal.
     */

    static ThreadLocal _currentRequest = new ThreadLocal();

    
    /**
     * Looks up an instance of a service and creates one if necessary.
     *
     * @param   session             the current session (for storing
     *                              instances).
     * @param   serviceClassName    the fully qualified name of the class
     *                              to instantiate.
     * @param   name                the name to use for the instance.
     * @param   requiredType        The type the service must have. May be
     *                              null. 
     */

    public synchronized Service getServiceInstance(HttpSession session,
            String serviceClassName, Object name, Class requiredType)
        throws ClassNotFoundException, IllegalAccessException,
               InstantiationException, InvocationTargetException,
               NoSuchMethodException {

        if (requiredType == null) {
            requiredType = Service.class;
        } 

        String lookFor = serviceClassName;
        if (name != null) {
            lookFor += "/" + name;
        }
        Service inst = (Service)session.getAttribute(lookFor);
        if (inst == null) {
            Class clazz = Class.forName(serviceClassName);
            if (! requiredType.isAssignableFrom(clazz)) {
                throw new ClassCastException("The requested service class "
                    + clazz.getName() + " is not from the required type "
                    + requiredType.getName() + "");
            }
            inst = (Service)clazz.newInstance();
            Class[] paramTypes = new Class[1];
            Object[] params = new Object[1];
            paramTypes[0] = Environment.class;
            Method method = MethodUtils.getMatchingAccessibleMethod(clazz,
                "setWebcomponentEnvironment", paramTypes);
            if (method != null) {
                params[0] = new Environment();
                method.invoke(inst, params);
            }
            if (name != null) {
                paramTypes[0] = String.class;
                method = MethodUtils.getMatchingAccessibleMethod(clazz,
                    "setWebcomponentName", paramTypes);
                if (method != null) {
                    params[0] = name;
                    method.invoke(inst, params);
                }
            }
            session.setAttribute(lookFor, inst);

            // initialize the service properties
            ServletConfig servletConfig = getServletConfig();
            Enumeration initParamNames =
                servletConfig.getInitParameterNames();
            String initParamName;
            String initParamValue;
            int pos;
            String packageName;
            String propertyName;
            HashMap candidates = new HashMap();
            while (initParamNames.hasMoreElements()) {
                initParamName = (String)initParamNames.nextElement();
                pos = initParamName.lastIndexOf('.');
                if (pos == -1) {
                    packageName = "";
                    propertyName = initParamName;
                } else {
                    packageName = initParamName.substring(0, pos);
                    propertyName = initParamName.substring(pos + 1);
                }
                String candidateName;
                if (serviceClassName.startsWith(packageName)) {
                    candidateName = (String)candidates.get(propertyName);
                    if (candidateName == null) {
                        candidates.put(propertyName, initParamName);
                    } else if (candidateName.length() < initParamName.length()) {
                        candidates.put(propertyName, initParamName);
                    }
                }
            }
            Iterator candidatesIterator = candidates.keySet().iterator();
            Class propertyType;
            while (candidatesIterator.hasNext()) {
                propertyName = (String)candidatesIterator.next();
                initParamName = (String)candidates.get(propertyName);
                initParamValue = servletConfig.getInitParameter(initParamName);
                propertyType =
                    PropertyUtils.getPropertyType(inst, propertyName);
                if (propertyType != null) {
                    if (propertyType.getComponentType() == String.class) {
                        PropertyUtils.setSimpleProperty(inst, propertyName,
                                StringUtils.tokenize(initParamValue, ';'));
                    } else {
                        try {
                            PropertyUtils.setSimpleProperty(inst, propertyName,
                                    ConvertUtils.convert(
                                        initParamValue,
                                        propertyType));
                        } catch (Exception e) {
                            // try to instatiate a class of the supplied parameter
                            System.out.println("***** setting '" + propertyName + "' to an instance of '" + initParamValue + "'");
                            PropertyUtils.setSimpleProperty(inst, propertyName,
                                    getServiceInstance(session, initParamValue, null, null));
                        }
                    }
                } else {
                    System.out.println("***** property '" + propertyName + "' not matched");
                }
            }

            // tell the instance that we're done
            paramTypes = new Class[0];
            method = MethodUtils.getMatchingAccessibleMethod(clazz,
                "webcomponentInit", paramTypes);
            if (method != null) {
                params = new Object[0];
                method.invoke(inst, params);
            }
        }
        return inst;
    }

    
    private String makeJavaScriptServerInfo(HttpServletRequest request) {
        // reconstruct the start of the URL
        StringBuffer contextURL = new StringBuffer();
        String scheme = request.getScheme();
        int port = request.getServerPort();
        
        contextURL.append(scheme);
        contextURL.append("://");
        contextURL.append(request.getServerName());
        if ((scheme.equals("http") && port != 80) ||
            (scheme.equals ("https") && port != 443)) {
            contextURL.append(':');
            contextURL.append(request.getServerPort());
        }
        contextURL.append(request.getContextPath());
        
        return "if (!qx || !qx.core || !qx.core.ServerSettings) {" +
                 "qx.OO.defineClass(\"qx.core.ServerSettings\");" +
                "}" +
                "qx.core.ServerSettings.serverPathPrefix = \"" + contextURL.toString() + "\";" +
                "qx.core.ServerSettings.serverPathSuffix = \";jsessionid=" + request.getSession().getId() + "\";" +
                "qx.core.ServerSettings.sessionTimeoutInSeconds = " + request.getSession().getMaxInactiveInterval() + ";" +
                "qx.core.ServerSettings.lastSessionRefresh = (new Date()).getTime();";
    }
    
    
    /**
     * Handles an RPC call.
     * 
     * @param   request             the servlet request.
     * @param   requestString       the JSON request string.
     * 
     * @return  the response as a string.
     * 
     * @throws  Exception           passed through.
     */
    
    protected String handleRPC(HttpServletRequest request,
                               String requestString) throws Exception {
        _currentRequest.set(request);
        String instanceId = request.getParameter("instanceId");
        JSONObject req = new JSONObject(requestString);
        Object serviceClassNameObject = req.get("service");
        String serviceClassName = null;
        if (!serviceClassNameObject.equals(null)) {
            serviceClassName = serviceClassNameObject.toString();
        }
        String methodName = req.getString("method");
        JSONObject res = new JSONObject();
        String callId = req.getString("id");
        if (callId != null) {
            res.put("id", callId);
        }
        
        // special handling: if the service class was not specified and the
        // method is "refreshSession", we refresh the session :-)
        if (serviceClassName == null && methodName.equals("refreshSession")) {
            res.put("result", "function() {" + makeJavaScriptServerInfo(request) +
                    "return true;}()");
        } else {
            RemoteService inst = (RemoteService) getServiceInstance(
                    request.getSession(), serviceClassName, instanceId,
                    RemoteService.class);
            JSONArray args = req.getJSONArray("params");
    
            // call the method
            Object retVal = null;
            Throwable error = null;
            try {
                retVal = RemoteCallUtils.callCompatibleMethod(inst, methodName, args);
            } catch (Throwable e) {
                error = e;
            }
            if (error != null) {
                if (error instanceof InvocationTargetException) {
                    error = ((InvocationTargetException)error).getTargetException();
                }
                JSONObject ex = new JSONObject();
                ex.put("code", 500);    // 500: internal server error
                                        // (executing the method generated
                                        //  an exception)
                                        // TODO: properly detect common errors
                                        //       like "method not found" and
                                        //       return appropriate codes
                                        // TODO: fill in the origin property
                ex.put("message", error.getClass().getName() + ": " + error.getMessage());
                res.put("error", ex);
                //error.printStackTrace();
                // FIXME: Use proper logging (configurable; default: System.out)
            } else {
                res.put("result", RemoteCallUtils.fromJava(retVal));
            }
        }
        return res.toString();
    }
    
    
    /**
     * Returns context path information to the client (as a JavaScript hash
     * map).
     * 
     * @param   request             the servlet request.
     * @param   response            the servlet response.
     * 
     * @throws  ServletException    thrown when writing the response fails.
     */
    
    public void doGet(HttpServletRequest request,
                      HttpServletResponse response)
        throws ServletException {
        
        response.setContentType("text/javascript; charset=UTF-8");
        Writer responseWriter;
        try {
            responseWriter = response.getWriter();
        } catch (Exception e) {
            throw new ServletException("Cannot generate a response");
        }
        String jsTransportId = request.getParameter("_jstransport_id");
        if (jsTransportId != null) {
            try {
                String requestString = request.getParameter("_jstransport_data");
                //System.out.println("Request string: " + requestString);
                //System.out.println("Session id: " + request.getSession().getId());
                //System.out.println("Requested session id: " + request.getRequestedSessionId());
                String res = handleRPC(request, requestString);
                
                responseWriter.write("qx.io.remote.JsTransport._requestFinished(\"" +
                        jsTransportId + "\", " + res + ");");
            } catch (Exception e) {
                throw new ServletException("Cannot execute remote method", e);
            }
        } else {
            try {
                responseWriter.write(makeJavaScriptServerInfo(request));
            } catch (Exception e) {
                throw new ServletException("Cannot write path information", e);
            }
        }
    }
    
    
    /**
     * Remote method execution. The method name and parameters are expected
     * in JSON format in the request body.
     * 
     * @param   request             the servlet request.
     * @param   response            the servlet response.
     * 
     * @throws  ServletException    thrown when executing the method or writing
     *                              the response fails.
     */
    
    public void doPost(HttpServletRequest request,
                       HttpServletResponse response)
        throws ServletException {

        InputStream is = null;
        Reader reader = null;
        try {
            String requestString = null;
            
            String contentType = request.getHeader("Content-Type");
            if (contentType != null) {
                if (contentType.indexOf("x-www-form-urlencoded") != -1) {
                    requestString = request.getParameter("_data_");
                }
            }
            if (requestString == null) {
                is = request.getInputStream();
                reader = new InputStreamReader(is, "UTF-8");
                StringBuffer requestBuffer = new StringBuffer();
                char[] readBuffer = new char[BUFFER_SIZE];
                int length;
                while ((length = reader.read(readBuffer)) != -1) {
                    requestBuffer.append(readBuffer, 0, length);
                }
                requestString = requestBuffer.toString();
            }
            System.out.println("Request string: " + requestString);
            String res = handleRPC(request, requestString);
            
            response.setContentType("text/plain; charset=UTF-8");
            Writer responseWriter = response.getWriter();
            responseWriter.write(res);            
        } catch (Exception e) {
            throw new ServletException("Cannot execute remote method", e);
        } finally {
            if (reader != null) {
                try {
                    reader.close();
                } catch (Exception e) {
                    // ignore
                }
            }
            if (is != null) {
                try {
                    is.close();
                } catch (Exception e) {
                    // ignore
                }
            }
        }
    }

}
