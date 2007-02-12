package net.jsunit.action;

import net.jsunit.XmlRenderable;

public class BrowserTestRunnerConfigurationAction extends JsUnitBrowserTestRunnerAction {
    public String execute() throws Exception {
        return SUCCESS;
    }

    public XmlRenderable getXmlRenderable() {
        return runner;
    }
}
