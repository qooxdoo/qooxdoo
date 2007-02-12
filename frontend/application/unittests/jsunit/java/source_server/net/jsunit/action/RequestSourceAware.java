package net.jsunit.action;

public interface RequestSourceAware {

    void setRequestIPAddress(String ipAddress);

    void setRequestHost(String host);
}
