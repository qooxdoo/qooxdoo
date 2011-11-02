##
# Module 'sha' is deprecated since Python 2.5: Use the 'hashlib' module instead.
##

try:
    import hashlib
    sha_construct = hashlib.sha1
except ImportError:
    import sha
    sha_construct = sha.new

def getHash(buffer):
    hashCode = sha_construct(buffer).hexdigest()
    return hashCode
