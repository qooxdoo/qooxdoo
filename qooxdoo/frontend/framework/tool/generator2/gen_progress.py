
######################################################################
#  CORE: PROGRESS DISPLAY
######################################################################

import sys

def printProgress(pos, length, quiet=True):

    if quiet:
        return

    # starts normally at null, but this is not useful here
    # also the length is normally +1 the real size
    pos += 1

    thisstep = 10 * pos / length
    prevstep = 10 * (pos-1) / length

    if thisstep != prevstep:
        sys.stdout.write(" %s%%" % (thisstep * 10))
        sys.stdout.flush()

    if pos == length:
        sys.stdout.write("\n")
        sys.stdout.flush()





