package net.jsunit.action;

import com.opensymphony.xwork.Action;
import net.jsunit.BrowserTestRunner;

public abstract class JsUnitBrowserTestRunnerAction implements Action, XmlProducer {

    protected BrowserTestRunner runner;

    public void setBrowserTestRunner(BrowserTestRunner runner) {
        this.runner = runner;
    }

    public BrowserTestRunner getBrowserTestRunner() {
        return runner;
    }

}
