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


/**
 * A class for assisting with remote calls in JSON syntax.
 * This class can convert parameters and return values, and it can find and
 * call methods compatible to a given name and a set of parameters.
 */

public class RemoteCallUtils {
    

    /**
     * A cache for all methods called by clients.
     */

    protected static HashMap _methodCache = new HashMap();

    
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

    public static Object toJava(Object obj, Class targetType) {
        try {
            if (obj == JSONObject.NULL) {
                if (targetType == Integer.TYPE || targetType == Double.TYPE ||
                    targetType == Boolean.TYPE) {
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
                Object bean = targetType.newInstance();
                if (names != null) {
                    int length = names.length();
                    String name;
                    PropertyDescriptor desc;
                    for (int i = 0; i < length; ++i) {
                        name = names.getString(i);
                        desc = PropertyUtils.getPropertyDescriptor(bean, name);
                        PropertyUtils.setSimpleProperty(bean, name,
                            toJava(jsonObject.get(name), desc.getPropertyType()));
                    }
                }
                return bean;
            }
            if (targetType == null || targetType == Object.class) {
                return obj;
            }
            Class actualTargetType;
            if (targetType == Integer.TYPE) {
                actualTargetType = Integer.class;
            } else if (targetType == Double.TYPE) {
                actualTargetType = Double.class;
            } else if (targetType == Boolean.TYPE) {
                actualTargetType = Boolean.class;
            } else {
                actualTargetType = targetType;
            }
            if (!actualTargetType.isAssignableFrom(obj.getClass())) {
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
     * Internal helper method.
     */

    private static Map filter(Map map) {
        map.remove("class");
        return map;
    }
    
    
    /**
     * Converts "normal" java types to JSON stuff.
     *
     * @param       obj                 the object to convert.
     */

    public static Object fromJava(Object obj) throws IllegalAccessException,
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
        return fromJava(filter(PropertyUtils.describe(obj)));
    }


    /**
     * Internal helper method.
     */

    private static void convertParameters(JSONArray src, Object[] dest,
                                          Class[] methodParameterTypes) {
        int length = dest.length;
        for (int i = 0; i < length; ++i) {
            dest[i] = toJava(src.get(i), methodParameterTypes[i]);
        }
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
     * @exception   NoSuchMethodException   thrown if no matching method
     *                                      exists.
     * @exception   IllegalAccessException  thrown if the matching method is
     *                                      not accessible.
     * @exception   InvocationTargetException   thrown if the method call
     *                                          produces an exception.
     */

    protected static Object callCompatibleMethod(Object instance,
            String methodName, JSONArray parameters)
        throws NoSuchMethodException, IllegalAccessException,
               InvocationTargetException {

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

