package net.jsunit;

public class TestPortManager {

    /**
     * Unassigned range from 48004 to 48555:
     * @see <a href="http://www.iana.org/assignments/port-numbers">IANA Port Assignments</a>
     */
    private static int port = 48004;

	public int newPort() {
		return port++;
	}
	
}
