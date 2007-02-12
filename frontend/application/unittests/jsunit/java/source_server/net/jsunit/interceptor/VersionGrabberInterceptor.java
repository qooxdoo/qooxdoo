package net.jsunit.interceptor;

import com.opensymphony.xwork.Action;
import net.jsunit.version.JsUnitWebsiteVersionGrabber;
import net.jsunit.action.VersionGrabberAware;

public class VersionGrabberInterceptor extends JsUnitInterceptor {
    protected void execute(Action targetAction) {
        VersionGrabberAware aware = ((VersionGrabberAware) targetAction);
        aware.setVersionGrabber(new JsUnitWebsiteVersionGrabber());
    }
}
