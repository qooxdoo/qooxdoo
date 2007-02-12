package net.jsunit.action;

import net.jsunit.InvalidBrowserIdException;
import net.jsunit.TestRunManager;
import net.jsunit.XmlRenderable;
import net.jsunit.utility.StringUtility;

public class TestRunnerAction extends JsUnitBrowserTestRunnerAction implements RequestSourceAware {

    private TestRunManager manager;
    private String url;
    private String remoteAddress;
    private String remoteHost;
    private String browserId;
    private boolean badBrowserId = false;

    public String execute() throws Exception {
        runner.logStatus(requestReceivedMessage());
        //noinspection SynchronizeOnNonFinalField
        synchronized (runner) {
            manager = new TestRunManager(runner, url);
            if (!StringUtility.isEmpty(browserId)) {
                try {
                    manager.limitToBrowserWithId(Integer.parseInt(browserId));
                } catch (InvalidBrowserIdException e) {
                    badBrowserId = true;
                    return ERROR;
                } catch (NumberFormatException e) {
                    badBrowserId = true;
                    return ERROR;
                }
            }
            manager.runTests();
        }
        runner.logStatus("Done running tests");
        return SUCCESS;
    }

    private String requestReceivedMessage() {
        String message = "Received request to run tests";
        if (!StringUtility.isEmpty(remoteAddress) || !StringUtility.isEmpty(remoteHost)) {
            message += " from ";
            if (!StringUtility.isEmpty(remoteHost)) {
                message += remoteHost;
                if (!StringUtility.isEmpty(remoteAddress) && !remoteAddress.equals(remoteHost))
                    message += " (" + remoteAddress + ")";
            } else {
                message += remoteAddress;
            }
        }
        return message;
    }

    public XmlRenderable getXmlRenderable() {
        if (badBrowserId) {
            return new ErrorXmlRenderable("Invalid browser ID: " + browserId);
        }
        return manager.getTestRunResult();
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public void setRequestIPAddress(String ipAddress) {
        remoteAddress = ipAddress;
    }

    public void setRequestHost(String host) {
        remoteHost = host;
    }

    public void setBrowserId(String browserId) {
        this.browserId = browserId;
    }
}
