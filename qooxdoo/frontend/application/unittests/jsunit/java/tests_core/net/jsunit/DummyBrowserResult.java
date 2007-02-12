package net.jsunit;

import net.jsunit.model.BrowserResult;
import net.jsunit.model.ResultType;
import org.jdom.Document;

public class DummyBrowserResult extends BrowserResult {

    private final boolean success;
    private final int failureCount;
    private final int errorCount;

    public DummyBrowserResult(boolean success, int failureCount, int errorCount) {
        this.success = success;
        this.failureCount = failureCount;
        this.errorCount = errorCount;
    }

    public boolean wasSuccessful() {
        return success;
    }

    public int getFailureCount() {
        return failureCount;
    }

    public int getErrorCount() {
        return errorCount;
    }

    public ResultType getResultType() {
        if (getErrorCount() > 0)
            return ResultType.ERROR;
        if (getFailureCount() > 0)
            return ResultType.FAILURE;
        return ResultType.SUCCESS;
    }

    public Document asXmlDocument() {
        return new Document(asXml());
    }

}
