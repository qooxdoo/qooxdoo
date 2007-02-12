package net.jsunit;

import net.jsunit.model.Browser;
import net.jsunit.utility.StringUtility;

public class BrowserLaunchSpecification {

    private final Browser browser;
    private final String overrideUrl;

    public BrowserLaunchSpecification(Browser browser) {
        this(browser, null);
    }

    public BrowserLaunchSpecification(Browser browser, String overrideUrl) {
        this.browser = browser;
        this.overrideUrl = overrideUrl;
    }

    public String getOverrideUrl() {
        return overrideUrl;
    }

    public boolean hasOverrideUrl() {
        return !StringUtility.isEmpty(overrideUrl);
    }

    public boolean isForDefaultBrowser() {
        return browser.isDefault();
    }

    public Browser getBrowser() {
        return browser;
    }
}
