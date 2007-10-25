
######################################################################
#  CORE: SESSION STABLE HASH CODE SUPPORT
######################################################################

import os, sys, cPickle

script_path = os.path.dirname(os.path.abspath(sys.argv[0]))
sys.path.insert(0, os.path.join(script_path, "../modules"))

import mapper

# calculates a hash code (simple incrementer)
# cache all already calculates inputs for the next session using pickle
# to keep hash codes identical between different sessions
def toHashCode(id, hashes, cachePath):

    if not cachePath.endswith(os.sep):
        cachePath += os.sep

    try:
        hashes = cPickle.load(open(cachePath + "hashes", 'rb'))
    except (IOError, EOFError, cPickle.PickleError, cPickle.UnpicklingError):
        hashes = {}

    if not hashes.has_key(id):
        hashes[id] = mapper.convert(len(hashes))

        try:
            cPickle.dump(hashes, open(cachePath + "hashes", 'wb'), 2)
        except (IOError, EOFError, cPickle.PickleError, cPickle.UnpicklingError):
            print ">>> Could not store hash cache: %s" % cachePath
            sys.exit(1)

    return hashes[id]





