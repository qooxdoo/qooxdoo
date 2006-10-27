// TODO: maybe support indexed and/or mapped properties
package net.sf.qooxdoo.rpc;

import java.beans.PropertyDescriptor;
import java.lang.reflect.Array;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Date;
import java.util.Iterator;
import java.util.Map;
import java.util.HashMap;
import java.util.Set;

import org.apache.commons.beanutils.PropertyUtils;

import org.json.JSONArray;
import org.json.JSONObject;

import net.sf.qooxdoo.rpc.RemoteServiceException;


/**
 * A class for assisting with remote calls in JSON syntax.
 * This class can convert parameters and return values, and it can find and
 * call methods compatible to a given name and a set of parameters.
 */

public class RemoteCallUtils {
    

    /**
     * A cache for all methods called by clients.
     */

    protected HashMap _methodCache = new HashMap();

    
    /**
     * Converts JSON types to "normal" java types.
     *
     * @param       obj                 the object to convert (must not be
     *                                  <code>null</code>, but can be
     *                                  <code>JSONObject.NULL</code>).
     * @param       targetType          the desired target type (must not be
     *                                  <code>null</code>).
     *
     * @return      the converted object.
     *
     * @exception   IllegalArgumentException    thrown if the desired
     *                                          conversion is not possible.
     */

    public Object toJava(Object obj, Class targetType) {
        try {
            if (obj == JSONObject.NULL) {
                if (targetType == Integer.TYPE || targetType == Double.TYPE ||
                    targetType == Boolean.TYPE || targetType == Long.TYPE) {
                    // null does not work for primitive types
                    throw new Exception();
                }
                return null;
            }
            if (obj instanceof JSONArray) {
                Class componentType;
                if (targetType == null || targetType == Object.class) {
                    componentType = null;
                } else {
                    componentType = targetType.getComponentType();
                }
                JSONArray jsonArray = (JSONArray)obj;
                int length = jsonArray.length();
                Object retVal = Array.newInstance(
                    (componentType == null ? Object.class : componentType),
                    length);
                for (int i = 0; i < length; ++i) {
                    Array.set(retVal, i, toJava(jsonArray.get(i), componentType));
                }
                return retVal;
            }
            if (obj instanceof JSONObject) {
                JSONObject jsonObject = (JSONObject)obj;
                JSONArray names = jsonObject.names();
                if (targetType == Map.class || targetType == HashMap.class ||
                        targetType == null || targetType == Object.class) {
                    HashMap retVal = new HashMap();
                    if (names != null) {
                        int length = names.length();
                        String name;
                        for (int i = 0; i < length; ++i) {
                            name = names.getString(i);
                            retVal.put(name, toJava(jsonObject.get(name), null));
                        }
                    }
                    return retVal;
                }
                Object bean;
                String requestedTypeName = jsonObject.optString("class", null);
                if (requestedTypeName != null) {
                    Class clazz = resolveClassHint(requestedTypeName, targetType);
                    if (clazz == null || !targetType.isAssignableFrom(clazz)) {
                        throw new Exception();
                    }
                    bean = clazz.newInstance();
                    // TODO: support constructor parameters
                } else {
                    bean = targetType.newInstance();
                }
                if (names != null) {
                    int length = names.length();
                    String name;
                    PropertyDescriptor desc;
                    for (int i = 0; i < length; ++i) {
                        name = names.getString(i);
                        if (!"class".equals(name)) {
                            desc = PropertyUtils.getPropertyDescriptor(bean, name);
                            PropertyUtils.setSimpleProperty(bean, name,
                                toJava(jsonObject.get(name), desc.getPropertyType()));
                        }
                    }
                }
                return bean;
            }
            if (targetType == null || targetType == Object.class) {
                return obj;
            }
            Class actualTargetType;
            Class sourceType = obj.getClass();
            if (targetType == Integer.TYPE) {
                actualTargetType = Integer.class;
            } else if (targetType == Boolean.TYPE) {
                actualTargetType = Boolean.class;
            } else if ((targetType == Double.TYPE || targetType == Double.class) &&
                    Number.class.isAssignableFrom(sourceType)) {
                return new Double(((Number)obj).doubleValue());
                // TODO: maybe return obj directly if it's a Double 
            } else if ((targetType == Long.TYPE || targetType == Long.class) &&
                       Number.class.isAssignableFrom(sourceType)) {
                return new Long(((Number)obj).longValue());
            } else {
                actualTargetType = targetType;
            }
            if (!actualTargetType.isAssignableFrom(sourceType)) {
                throw new Exception();
            }
            return obj;
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Cannot convert " +
                    (obj == null ? null : obj.getClass().getName()) + " to " +
                    (targetType == null ? null : targetType.getName()));
        }
    }


    /**
     * Returns the actual class that a client-sent object should be converted
     * into.
     * <p>
     * For example, an instance of "BaseClass" may be needed on the server, and
     * the client may have specified "DerivedClass" as the class hint. The main
     * responsibility of the <code>resolveClassHint</code> method is to
     * check whether "DerivedClass" should actually be instantiated
     * (which could pose a security risk, depending on the class).
     * </p>
     * <p>
     * The default implementation of <code>resolveClassHint</code> returns
     * <code>false</code>, but this may change in future versions, so be sure
     * to call the super class method in derived classes instead of just
     * returning <code>false</code>.
     * </p>
     * <p>
     * If a <code>Class</code> is returned that is not compatible with
     * <code>targetType</code>, an exception will be thrown later on (without
     * creating an instance of the class first).
     * </p>
     * 
     * @param   requestedTypeName   the fully qualified type requested by the
     *                              client.
     * @param   targetType          the type needed on the server.
     * 
     * @return  the type to instantiate (usually the result of calling
     *          <code>Class.forName(requestedTypeName)</code>) or
     *          <code>null</code> if instantiation is not allowed.
     * 
     * @throws  Exception           thrown if anything goes wrong while
     *                              resolving the hint. 
     */
    
    protected Class resolveClassHint(String requestedTypeName,
                                     Class targetType)
        throws Exception {
        
        return null;
    }

    
    /**
     * Filters away properties of an object before it's converted to JSON form.
     * 
     * @param   obj                 the original object.
     * @param   map                 the properties map that was created from
     *                              the object. Using its <code>remove</code>
     *                              method, properties can be removed.
     */

    protected Map filter(Object obj, Map map) {
        map.remove("class");
        return map;
    }
    
    
    /**
     * Converts "normal" java types to JSON stuff.
     *
     * @param       obj                 the object to convert.
     */

    public Object fromJava(Object obj) throws IllegalAccessException,
                                              InvocationTargetException,
                                              NoSuchMethodException {
        if (obj == null) {
            return JSONObject.NULL;
        }
        if (obj instanceof String) {
            return obj;
        }
        if (obj instanceof Date) {
            return obj;
        }
        if (obj instanceof Integer || obj instanceof Double ||
            obj instanceof Boolean) {
            return obj;
        }
        // FIXME: find a better way to handle longs
        if (obj instanceof Long) {
        	return new Double(((Long)obj).doubleValue());
        }
        if (obj instanceof Object[]) {
            Object[] objectArray = (Object[])obj;
            JSONArray jsonArray = new JSONArray();
            for (int i = 0; i < objectArray.length; ++i) {
                jsonArray.put(fromJava(objectArray[i]));
            }
            return jsonArray;
        }
        Class componentType = obj.getClass().getComponentType();
        if (componentType == Integer.TYPE) {
            JSONArray jsonArray = new JSONArray();
            int[] intArray = (int[])obj;
            for (int i = 0; i < intArray.length; ++i) {
                jsonArray.put(intArray[i]);
            }
            return jsonArray;
        }
        // FIXME: find a better way to handle longs
        if (componentType == Long.TYPE) {
            JSONArray jsonArray = new JSONArray();
            long[] longArray = (long[])obj;
            for (int i = 0; i < longArray.length; ++i) {
                jsonArray.put((double)(longArray[i]));
            }
            return jsonArray;
        }
        if (componentType == Double.TYPE) {
            JSONArray jsonArray = new JSONArray();
            double[] doubleArray = (double[])obj;
            for (int i = 0; i < doubleArray.length; ++i) {
                jsonArray.put(doubleArray[i]);
            }
            return jsonArray;
        }
        if (componentType == Boolean.TYPE) {
            JSONArray jsonArray = new JSONArray();
            boolean[] booleanArray = (boolean[])obj;
            for (int i = 0; i < booleanArray.length; ++i) {
                jsonArray.put(booleanArray[i]);
            }
            return jsonArray;
        }
        if (obj instanceof Map) {
            Map map = (Map)obj;
            Iterator keyIterator = map.keySet().iterator();
            JSONObject jsonObject = new JSONObject();
            Object key;
            while (keyIterator.hasNext()) {
                key = keyIterator.next();
                jsonObject.put((key == null ? null : key.toString()), fromJava(map.get(key)));
            }
            return jsonObject;
        }
        if (obj instanceof Set) {
            Set set = (Set)obj;
            Iterator iterator = set.iterator();
            JSONObject jsonObject = new JSONObject();
            Object key;
            while (iterator.hasNext()) {
                key = iterator.next();
                jsonObject.put((key == null ? null : key.toString()), true);
            }
            return jsonObject;
        }
        return fromJava(filter(obj, PropertyUtils.describe(obj)));
    }


    /**
     * Internal helper method.
     */

    private void convertParameters(JSONArray src, Object[] dest,
                                          Class[] methodParameterTypes) {
        int length = dest.length;
        for (int i = 0; i < length; ++i) {
            dest[i] = toJava(src.get(i), methodParameterTypes[i]);
        }
    }
    
    
    /**
     * Check if a method throws the expected exception (used as a tag to
     * allow a method to be called).
     */

    protected boolean throwsExpectedException(Method method) {
        Class[] methodExceptionTypes = method.getExceptionTypes();
        int exceptionCount = methodExceptionTypes.length;
        for (int i = 0; i < exceptionCount; ++i) {
            if (RemoteServiceException.class.isAssignableFrom(methodExceptionTypes[i])) {
                return true;
            }
        }
        return false;
    }


    /**
     * Invokes a method compatible to the specified parameters.
     *
     * @param       instance            the object on which to invoke the
     *                                  method (must not be
     *                                  <code>null</code>).
     * @param       methodName          the name of the method to invoke (must
     *                                  not be <code>null</code>).
     * @param       parameters          the method parameters (as JSON
     *                                  objects - must not be
     *                                  <code>null</code>).
     *
     * @exception   Exception           thrown if the method cannot be found
     *                                  or if invoking it fails. If the method
     *                                  cannot be found, a
     *                                  <code>NoSuchMethodException</code> is
     *                                  thrown.
     */

    protected Object callCompatibleMethod(Object instance,
            String methodName, JSONArray parameters)
        throws Exception {

        Class clazz = instance.getClass();
        StringBuffer cacheKeyBuffer = new StringBuffer(clazz.getName());
        cacheKeyBuffer.append('-');
        cacheKeyBuffer.append(methodName);
        int parameterCount = parameters.length();
        Object parameter;
        int i;
        for (i = 0; i < parameterCount; ++i) {
            parameter = parameters.get(i);
            cacheKeyBuffer.append('-');
            cacheKeyBuffer.append(
                parameter == null ? null : parameter.getClass().getName());
        }
        String cacheKey = cacheKeyBuffer.toString();
        Method method = (Method)_methodCache.get(cacheKey);
        Class[] methodParameterTypes;
        Object[] convertedParameters = new Object[parameterCount];
        String lastError = null;
        if (method == null) {
            Method[] methods = clazz.getMethods();
            Method candidate;
            int methodCount = methods.length;
            for (i = 0; i < methodCount; ++i) {
                candidate = methods[i];
                if (!candidate.getName().equals(methodName)) {
                    continue;
                }
                if (!throwsExpectedException(candidate)) {
                    continue;
                }
                methodParameterTypes = candidate.getParameterTypes();
                if (methodParameterTypes.length != parameterCount) {
                    continue;
                }
                try {
                    convertParameters(parameters, convertedParameters,
                                      methodParameterTypes);
                } catch (Exception e) {
                    lastError = e.getMessage();
                    continue;
                }
                method = candidate;
                break;
            }
            if (method == null) {
                if (lastError == null) {
                    throw new NoSuchMethodException(methodName);
                }
                throw new NoSuchMethodException(methodName + " - " + lastError);
            }
            _methodCache.put(cacheKey, method);
            return method.invoke(instance, convertedParameters);
        }

        try {
            convertParameters(parameters, convertedParameters,
                              method.getParameterTypes());
        } catch (Exception e) {
            // maybe it works with another method - not very fast from a
            // performance standpoint, but supports a variety of methods
            _methodCache.remove(cacheKey);
            return callCompatibleMethod(instance, methodName, parameters);
        }

        return method.invoke(instance, convertedParameters);
    }
    
}
