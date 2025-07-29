package com.pijul.aider.versioning;

import java.io.IOException;

public interface VersioningBackend {
    String getDiff() throws IOException;
    void add(String file) throws IOException;
    void record(String message) throws IOException;
    String status() throws IOException;
}
