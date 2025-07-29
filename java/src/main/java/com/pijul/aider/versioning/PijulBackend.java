package com.pijul.aider.versioning;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class PijulBackend implements VersioningBackend {

    private String executeCommand(String command) throws IOException {
        Process process = Runtime.getRuntime().exec(command);
        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }
        return output.toString();
    }

    @Override
    public String getDiff() throws IOException {
        return executeCommand("pijul diff");
    }

    @Override
    public void add(String file) throws IOException {
        executeCommand("pijul add " + file);
    }

    @Override
    public void record(String message) throws IOException {
        executeCommand("pijul record -m \"" + message + "\"");
    }

    @Override
    public String status() throws IOException {
        return executeCommand("pijul status");
    }
}
