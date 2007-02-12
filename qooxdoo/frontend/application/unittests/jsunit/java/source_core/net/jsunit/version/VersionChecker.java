package net.jsunit.version;

import net.jsunit.utility.SystemUtility;

public class VersionChecker {

    private double installedVersion;
    private Double latestVersion;
    private VersionGrabber grabber;

    public static VersionChecker forDefault() {
        return new VersionChecker(SystemUtility.jsUnitVersion(), new JsUnitWebsiteVersionGrabber());
    }

    public VersionChecker(double currentVersion, VersionGrabber grabber) {
        this.installedVersion = currentVersion;
        this.grabber = grabber;
    }

    public boolean isUpToDate() {
        return installedVersion >= getLatestVersion();
    }

    public double getLatestVersion() {
        if (latestVersion == null) {
            try {
                latestVersion = grabber.grabVersion();
            } catch (Exception e) {
                latestVersion = 0d;
            }
        }
        return latestVersion;
    }

    public void setLatestVersion(double version) {
        latestVersion = version;
    }

    public String outOfDateString() {
        StringBuffer buffer = new StringBuffer();
        buffer.append("*** Your JsUnit version (");
        buffer.append(installedVersion);
        buffer.append(") is out of date.  There is a newer version available (");
        buffer.append(getLatestVersion());
        buffer.append(") at http://www.jsunit.net ***");
        return buffer.toString();
    }

}
