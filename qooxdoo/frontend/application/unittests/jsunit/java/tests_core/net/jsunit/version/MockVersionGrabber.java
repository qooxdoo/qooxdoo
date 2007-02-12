package net.jsunit.version;

public class MockVersionGrabber implements VersionGrabber {

    public double version;

    public MockVersionGrabber(double version) {
        this.version = version;
    }

    public double grabVersion() {
        return version;
    }
}
