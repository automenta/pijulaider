package com.pijul.aider;

import java.util.List;
import java.util.ArrayList;
import com.pijul.aider.versioning.VersioningBackend;
import java.util.concurrent.CompletableFuture;
import java.io.IOException;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;

public class PijulBackend extends VersioningBackend implements Backend {
    @Override
    public CompletableFuture<Void> add(String file) {
        return executeCommand("pijul", "add", file);
    }

    @Override
    public CompletableFuture<Void> unstage(String file) {
        return executeCommand("pijul", "remove", file);
    }

    @Override
    public CompletableFuture<Void> record(String message) {
        return executeCommand("pijul", "record", "-m", message);
    }

    @Override
    public CompletableFuture<Void> unrecord(String hash) {
        return executeCommand("pijul", "unrecord", hash);
    }

    @Override
    public CompletableFuture<Void> channel(String subcommand, String name) {
        return executeCommand("pijul", "channel", subcommand, name);
    }

    @Override
    public CompletableFuture<Void> patch(String subcommand, String name) {
        return executeCommand("pijul", "patch", subcommand, name);
    }

    @Override
    public CompletableFuture<Void> apply(String patch) {
        return executeCommand("pijul", "apply", patch);
    }

    @Override
    public CompletableFuture<String> conflicts() {
        return executeCommandWithOutput("pijul", "conflicts");
    }

    @Override
    public CompletableFuture<Void> revert(String file) {
        return executeCommand("pijul", "revert", file);
    }

    @Override
    public CompletableFuture<Void> revertAll() {
        return executeCommand("pijul", "revert", ".");
    }

    @Override
    public CompletableFuture<String> diff() {
        return executeCommandWithOutput("pijul", "diff");
    }

    @Override
    public CompletableFuture<String> status() {
        return executeCommandWithOutput("pijul", "status");
    }

    @Override
    public CompletableFuture<Void> clear() {
        return executeCommand("pijul", "clear");
    }

    @Override
    public CompletableFuture<List<String>> listTrackedFiles() {
        return executeCommandWithListOutput("pijul", "ls");
    }

    @Override
    public CompletableFuture<List<String>> listUntrackedFiles() {
        return executeCommandWithListOutput("pijul", "ls", "--untracked");
    }

    @Override
    public CompletableFuture<Void> initialize() {
        return CompletableFuture.completedFuture(null);
    }

    @Override
    public CompletableFuture<Void> shutdown() {
        return CompletableFuture.completedFuture(null);
    }

    @Override
    public CompletableFuture<Void> undo() {
        return executeCommand("pijul", "undo");
    }

    private CompletableFuture<Void> executeCommand(String... commands) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                ProcessBuilder pb = new ProcessBuilder(commands)
                    .redirectErrorStream(true);
                Process process = pb.start();
                int exitCode = process.waitFor();
                if (exitCode != 0) {
                    throw new RuntimeException("Command failed: " + String.join(" ", commands));
                }
                return null;
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }).thenApply(result -> null);
    }

    private CompletableFuture<String> executeCommandWithOutput(String... commands) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                ProcessBuilder pb = new ProcessBuilder(commands)
                    .redirectErrorStream(true);
                Process process = pb.start();
                
                // Read output
                InputStream inputStream = process.getInputStream();
                ByteArrayOutputStream result = new ByteArrayOutputStream();
                byte[] buffer = new byte[1024];
                int bytesRead;
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    result.write(buffer, 0, bytesRead);
                }
                String output = result.toString().trim();
                
                int exitCode = process.waitFor();
                if (exitCode != 0) {
                    throw new RuntimeException("Command failed: " + String.join(" ", commands));
                }
                return output;
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
    }

    private CompletableFuture<List<String>> executeCommandWithListOutput(String... commands) {
        return executeCommandWithOutput(commands).thenApply(output -> {
            return java.util.Arrays.asList(output.split("\\s+"));
        });
    }
}