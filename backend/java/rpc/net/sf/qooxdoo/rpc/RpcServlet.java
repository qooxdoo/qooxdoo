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


/**
 * The servlet responsible for incoming RPC calls.
 * 
 * There's an init-param for this servlet called "referrerCheck".
 * It can have one of the following values:
 * <ul>
 *     <li><strong>strict</strong> (default): Calls are only accepted from
 *         pages within the same webapp as this servlet.</li>
 *     <li><strong>domain</strong>: Calls are only accepted from pages within
 *         the same domain.</li>
 *     <li><strong>session</strong>: Calls are accepted from pages in arbitrary
 *         domains, but all calls in a session must come from the same domain.
 *         </li>
 *     <li><strong>public</strong>: Calls are accepted from everywhere.</li>
 *     <li><strong>fail</strong>: No calls are accepted (useful for testing
 *         purposes).</li>
 * </ul> 
 */
public class RpcServlet extends HttpServlet {

    /** The size for the read buffer. */
    private static final int BUFFER_SIZE = 8192;

    /** Version UID. */
    private static final long serialVersionUID = 1L;

    /** Stores the current servlet instance as a ThreadLocal. */
    static ThreadLocal _currentInstance = new ThreadLocal();

    /** Stores the current request as a ThreadLocal. */
    static ThreadLocal _currentRequest = new ThreadLocal();

    /** The RemoteCallUtils instance that is used by this servlet. */
    protected RemoteCallUtils _remoteCallUtils;

    /** The referrer checking method used for RPC calls. */
    protected int _referrerCheck;
    
    protected static int REFERRER_CHECK_STRICT = 0;
    protected static int REFERRER_CHECK_DOMAIN = 1;
    protected static int REFERRER_CHECK_SESSION = 2;
    protected static int REFERRER_CHECK_PUBLIC = 3;
    protected static int REFERRER_CHECK_FAIL = 4;
    
    public static String SESSION_REFERRER_KEY = "_qooxdoo_rpc_referrer";
    
    protected static String ACCESS_DENIED_RESULT = "alert('Access denied. Please make sure that your browser sends correct referer headers.')";

    protected static int ERROR_ORIGIN_SERVER = 1;
    protected static int ERROR_ORIGIN_APPLICATION = 2;

    
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
            if (method == null) {
                method = MethodUtils.getMatchingAccessibleMethod(clazz,
                        "setQooxdooEnvironment", paramTypes);
            }
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

    
    protected String getContextURL(HttpServletRequest request) {
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
        
        return contextURL.toString();
    }
    
    
    protected String getDomainURL(HttpServletRequest request) {
        // reconstruct the start of the URL
        StringBuffer domainURL = new StringBuffer();
        String scheme = request.getScheme();
        int port = request.getServerPort();
        
        domainURL.append(scheme);
        domainURL.append("://");
        domainURL.append(request.getServerName());
        if ((scheme.equals("http") && port != 80) ||
            (scheme.equals ("https") && port != 443)) {
            domainURL.append(':');
            domainURL.append(request.getServerPort());
        }
        domainURL.append('/');
        
        return domainURL.toString();
    }
    
    
    private String makeJavaScriptServerInfo(HttpServletRequest request) {
        return  "if (!qx) {" +
                  "qx = new Object();" +
                "}" +
                "if (!qx.core) {" +
                  "qx.core = new Object();" +
                "}" +
                "if (!qx.core.ServerSettings) {" +
                  "qx.core.ServerSettings = new Object();" +
                "}" +
                "qx.core.ServerSettings.serverPathPrefix = \"" + getContextURL(request) + "\";" +
                "qx.core.ServerSettings.serverPathSuffix = \";jsessionid=" + request.getSession().getId() + "\";" +
                "qx.core.ServerSettings.sessionTimeoutInSeconds = " + request.getSession().getMaxInactiveInterval() + ";" +
                "qx.core.ServerSettings.lastSessionRefresh = (new Date()).getTime();";
    }
    
    
    /**
     * Generates a JSONObject from an exception (for returning it to the
     * client).
     * 
     * @param   error               the exception to convert.
     * 
     * @return  the converted exception.
     */
    
    protected JSONObject convertException(Throwable error) {
        int origin = ERROR_ORIGIN_SERVER;
        if (error instanceof InvocationTargetException) {
            error = ((InvocationTargetException)error).getTargetException();
            origin = ERROR_ORIGIN_APPLICATION;
        }
        JSONObject ex = new JSONObject();
        ex.put("origin", origin);
        ex.put("code", 500);    // 500: internal server error
                                // (executing the method generated
                                //  an exception)
                                // TODO: properly detect common errors
                                //       like "method not found" and
                                //       return appropriate codes
        ex.put("message", error.getClass().getName() + ": " + error.getMessage());
        ex.put("class", error.getClass().getName());
        ex.put("origMessage", error.getMessage());
        Throwable cause = error.getCause();
        if (cause != null) {
            ex.put("cause", convertException(cause));
        }
        return ex;
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
        _currentInstance.set(this);
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
                retVal = _remoteCallUtils.callCompatibleMethod(inst, methodName, args);
            } catch (Throwable e) {
                error = e;
            }
            if (error != null) {
                res.put("error", convertException(error));
                //error.printStackTrace();
                // FIXME: Use proper logging (configurable; default: System.out)
            } else {
                res.put("result", _remoteCallUtils.fromJava(retVal));
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
        
        String jsTransportId = request.getParameter("_ScriptTransport_id");
        if (jsTransportId != null) {
            try {
                if (!checkReferrer(request)) {
                    responseWriter.write(ACCESS_DENIED_RESULT);
                } else {
                    
                    String requestString = request.getParameter("_ScriptTransport_data");
                    //System.out.println("Request string: " + requestString);
                    //System.out.println("Session id: " + request.getSession().getId());
                    //System.out.println("Requested session id: " + request.getRequestedSessionId());
                    String res = handleRPC(request, requestString);
                    
                    responseWriter.write("qx.io.remote.transport.Script._requestFinished(\"" +
                            jsTransportId + "\", " + res + ");");
                }
            } catch (Exception e) {
                throw new ServletException("Cannot execute remote method", e);
            }
        } else {
            try {
                if (!checkReferrer(request)) {
                    responseWriter.write(ACCESS_DENIED_RESULT);
                } else {
                    responseWriter.write(makeJavaScriptServerInfo(request));
                }
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
            String res;
            String contentType = request.getHeader("Content-Type");
            if (!checkReferrer(request) || contentType == null ||
                contentType.indexOf("application/json") != 0) {
                res = ACCESS_DENIED_RESULT;
            } else {
                is = request.getInputStream();
                reader = new InputStreamReader(is, "UTF-8");
                StringBuffer requestBuffer = new StringBuffer();
                char[] readBuffer = new char[BUFFER_SIZE];
                int length;
                while ((length = reader.read(readBuffer)) != -1) {
                    requestBuffer.append(readBuffer, 0, length);
                }
                String requestString = requestBuffer.toString();
                System.out.println("Request string: " + requestString);
                res = handleRPC(request, requestString);
            }
            
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

    
    /**
     * Checks the referrer based on the configured strategy
     * 
     * @param   request             the incoming request.
     * 
     * @return  whether or not the request should be granted.
     */
    protected boolean checkReferrer(HttpServletRequest request) {
        if (_referrerCheck == REFERRER_CHECK_PUBLIC) {
            return true;
        }
        if (_referrerCheck == REFERRER_CHECK_FAIL) {
            return false;
        }
        String referrer = request.getHeader("Referer");
        if (referrer == null) {
            return false;
        }
        if (_referrerCheck == REFERRER_CHECK_STRICT) {
            String contextURL = getContextURL(request);
            if (!referrer.startsWith(contextURL)) {
                return false;
            }
            return true;
        }
        if (_referrerCheck == REFERRER_CHECK_DOMAIN) {
            String domainURL = getDomainURL(request);
            if (!referrer.startsWith(domainURL)) {
                return false;
            }
            return true;
        }
        if (_referrerCheck == REFERRER_CHECK_SESSION) {
            // find the domain part of the referrer
            int colonIndex = referrer.indexOf(":");
            if (colonIndex == -1) {
                return false;
            }
            int referrerLength = referrer.length();
            int i;
            for (i = colonIndex + 1;;++i) {
                if (i >= referrerLength) {
                    return false;
                }
                if (referrer.charAt(i) != '/') {
                    break;
                }
            }
            int slashIndex = referrer.indexOf("/", i + 1);
            if (slashIndex == -1) {
                return false;
            }
            String referrerDomain = referrer.substring(0, slashIndex + 1);
            HttpSession session = request.getSession();
            String oldReferrerDomain = (String)session.getAttribute(SESSION_REFERRER_KEY);
            if (oldReferrerDomain == null) {
                session.setAttribute(SESSION_REFERRER_KEY, referrerDomain);
            } else {
                if (!oldReferrerDomain.equals(referrerDomain)) {
                    return false;
                }
            }
            return true;
        }
        throw new IllegalStateException("Internal error: unknown referrer checking configuration");
    }
    
    
    /**
     * Initializes this servlet.
     * 
     * @param   config              the servlet config.
     */
    
    public void init(ServletConfig config) throws ServletException {
        super.init(config);
        
        _remoteCallUtils = getRemoteCallUtils();
        String referrerCheckName = config.getInitParameter("referrerCheck");
        if ("strict".equals(referrerCheckName)) {
            _referrerCheck = REFERRER_CHECK_STRICT;
        } else if ("domain".equals(referrerCheckName)) {
            _referrerCheck = REFERRER_CHECK_DOMAIN;
        } else if ("session".equals(referrerCheckName)) {
            _referrerCheck = REFERRER_CHECK_SESSION;
        } else if ("public".equals(referrerCheckName)) {
            _referrerCheck = REFERRER_CHECK_PUBLIC;
        } else if ("fail".equals(referrerCheckName)) {
            _referrerCheck = REFERRER_CHECK_FAIL;
        } else {
            _referrerCheck = REFERRER_CHECK_STRICT;
            log("No referrer checking configuration found. Using strict checking as the default.");
        }
    }

    
    /**
     * Returns the <code>RemoteCallUtils</code> instance that should be used
     * for processing RPC calls. 
     */
    
    protected RemoteCallUtils getRemoteCallUtils() {
        return new RemoteCallUtils();
    }
    
}
