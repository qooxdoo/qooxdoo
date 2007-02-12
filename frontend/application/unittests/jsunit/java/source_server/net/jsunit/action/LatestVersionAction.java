package net.jsunit.action;

import com.opensymphony.xwork.Action;
import net.jsunit.version.VersionGrabber;

public class LatestVersionAction implements Action, LatestVersionSource, VersionGrabberAware {
    private VersionGrabber versionGrabber;
    private double latestVersion;

    public String execute() throws Exception {
        try {
            latestVersion = versionGrabber.grabVersion();
            return SUCCESS;
        } catch (Exception e) {
            return ERROR;
        }
    }

    public double getLatestVersion() {
        return latestVersion;
    }

    public void setVersionGrabber(VersionGrabber versionGrabber) {
        this.versionGrabber = versionGrabber;
    }
}
