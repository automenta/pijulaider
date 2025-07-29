package com.pijul.aider.commands;

import com.pijul.aider.FileManager;
import com.pijul.aider.tui.ChatPanel;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.io.IOException;

import static org.mockito.Mockito.*;

public class AddCommandTest {

    @Test
    public void testExecute() throws IOException {
        FileManager fileManager = Mockito.mock(FileManager.class);
        ChatPanel chatPanel = Mockito.mock(ChatPanel.class);
        AddCommand addCommand = new AddCommand(fileManager, chatPanel);

        when(fileManager.readFile("test.txt")).thenReturn("test content");

        addCommand.execute(new String[]{"/add", "test.txt"});

        verify(chatPanel, times(1)).addMessage("File test.txt added to chat:\n" + "test content");
    }
}
