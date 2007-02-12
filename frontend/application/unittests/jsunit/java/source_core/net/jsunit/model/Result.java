package net.jsunit.model;

public interface Result {

    public int getErrorCount();

    public int getFailureCount();

    public int getTestCount();

    public ResultType getResultType();

    public boolean wasSuccessful();

    public String displayString();

}
