##
# This is a test and template file for config migration data files.
# At the moment, it does nothing.
#

##
# Transformation functions have to have this signature:
#   foo(extMap, key, val)
# where
# - extMap : a generator config.json map, wrapped as misc.ExtMap
# - key    : the (path-like) key to be changed
# - val    : the current value of the key

# As an example, this is a structure changing
# function, to change compile-options/code/optimize
# from a list into a map.
def func1(conf, key, val):
    
    # don't want to work on other keys
    assert key == "compile-options/code/optimize"

    # transform the optimize list into a map, with the given optimize
    # keywords as map keys and 'true' as their value
    newval = {}
    for i in val:  # ["strings", "variants", ...]
        newval[i] = True
    
    conf.set(key, newval)

    return # no return val, conf has to be altered in function


##
# The "transformations" symbol is mandatory. It takes a map as its
# value. 
# 
# Keys are (path-like) strings for generator config keys:
# - "compile-options/code/format":
#   keys without a leading "/" are taken to be job-level keys, i.e.
#   they will be matched against keys in jobs
# - "/default-job":
#   keys with a leading "/" are absolute keys and are matched against
#   the top-level of the configuration map
# - "packages/parts/*/include":
#   wildcard '*' is allowed as a part of the path, to match arbitrary
#   keys on that level
transformations = {

    ##
    # rename key
    #"compile-options/code/foo" : "compile-options/code/bar",

    ##
    # delete key
    #"compile-options/code/baz" : "",

    ##
    # calculate new value
    #"compile-options/code/optimize" : func1,

}
