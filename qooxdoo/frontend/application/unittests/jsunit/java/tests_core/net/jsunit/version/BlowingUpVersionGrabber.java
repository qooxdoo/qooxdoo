package net.jsunit.version;

public class BlowingUpVersionGrabber implements VersionGrabber {
    public double grabVersion() throws Exception {
        throw new Exception();
    }
}
