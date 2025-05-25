import { app } from "electron";
import fs from "fs";
import path from "path";

import {
  ChatRecord,
  ChatWithMessages,
  MessageRecord,
} from "../types/interfaces";

export class ChatManager {
  private chatsIndexPath = path.join(
    app.getPath("userData"),
    "chats",
    "chats.json",
  );
  private chatRecords: Record<string, ChatRecord> = this.getChatsFromDisk();
  private messageRecords: Record<string, MessageRecord[]> = {};

  public async getChatWithMessages(
    chatId: string,
  ): Promise<ChatWithMessages | null> {
    if (this.messageRecords[chatId] && this.chatRecords[chatId]) {
      return {
        chat: this.chatRecords[chatId],
        messages: this.messageRecords[chatId],
      };
    } else {
      return this.getChatWithMessagesFromDisk(chatId);
    }
  }

  public async writeChatWithMessages(
    chatWithMessages: ChatWithMessages,
  ): Promise<void> {
    if (!chatWithMessages?.chat?.id) {
      console.error(
        "writeChatWithMessages: malformed request",
        chatWithMessages,
      );
      return;
    }

    if (chatWithMessages.messages.length === 0) {
      return;
    }

    this.chatRecords[chatWithMessages.chat.id] = chatWithMessages.chat;
    this.messageRecords[chatWithMessages.chat.id] = chatWithMessages.messages;

    await this.writeChatToDisk(chatWithMessages);
    await this.writeChatsIndexToDisk();
  }

  public getChats(): Record<string, ChatRecord> {
    return this.chatRecords;
  }

  public async deleteChat(chatId: string): Promise<void> {
    delete this.chatRecords[chatId];
    delete this.messageRecords[chatId];
    await this.writeChatsIndexToDisk();
    await this.deleteChatFromDisk(chatId);
  }

  public async deleteAllChats(): Promise<void> {
    this.chatRecords = {};
    this.messageRecords = {};

    await this.deleteAllChatsFromDisk();
    await this.writeChatsIndexToDisk();
  }

  private async writeChatsIndexToDisk(): Promise<void> {
    try {
      await fs.promises.mkdir(this.getChatsPath(), { recursive: true });
      await fs.promises.writeFile(
        this.chatsIndexPath,
        JSON.stringify(this.chatRecords, null, 2),
      );
    } catch (error) {
      console.error("Error writing chats index file:", error);
    }
  }

  private async deleteAllChatsFromDisk(): Promise<void> {
    const chatsPath = this.getChatsPath();

    try {
      if (fs.existsSync(chatsPath)) {
        await fs.promises.rm(chatsPath, { recursive: true, force: true });
      }
    } catch (error) {
      console.error("Error deleting all chats from disk:", error);
    }
  }

  private async deleteChatFromDisk(chatId: string): Promise<void> {
    const chatPath = this.getChatPath(chatId);

    try {
      if (fs.existsSync(chatPath)) {
        await fs.promises.unlink(chatPath);
      }
    } catch (error) {
      console.error(`Error deleting chat file ${chatPath}:`, error);
    }
  }

  private async writeChatToDisk(
    chatWithMessages: ChatWithMessages,
  ): Promise<void> {
    const chatPath = this.getChatPath(chatWithMessages.chat.id);

    try {
      await fs.promises.mkdir(this.getChatsPath(), { recursive: true });
      await fs.promises.writeFile(
        chatPath,
        JSON.stringify(chatWithMessages, null, 2),
      );
    } catch (error) {
      console.error(`Error writing chat file ${chatPath}:`, error);
    }
  }

  private async getChatWithMessagesFromDisk(
    chatId: string,
  ): Promise<ChatWithMessages | null> {
    const chatPath = this.getChatPath(chatId);

    if (!fs.existsSync(chatPath)) {
      return null;
    }

    try {
      const content = await fs.promises.readFile(chatPath, "utf8");
      const chatWithMessages = JSON.parse(content);

      // Update in-memory records
      this.messageRecords[chatId] = chatWithMessages.messages;

      return chatWithMessages;
    } catch (error) {
      console.error(`Error reading chat file ${chatPath}:`, error);
      return null;
    }
  }

  private getChatsFromDisk(): Record<string, ChatRecord> {
    let result: Record<string, ChatRecord> = {};

    if (!fs.existsSync(this.chatsIndexPath)) {
      return result;
    }

    try {
      result = JSON.parse(fs.readFileSync(this.chatsIndexPath, "utf8"));
    } catch (error) {
      console.error("Error reading chats index file:", error);
    }

    return result;
  }

  private getChatsPath() {
    return path.join(app.getPath("userData"), "chats");
  }

  private getChatPath(chatId: string) {
    return path.join(this.getChatsPath(), `${chatId}.json`);
  }
}

let _chatManager: ChatManager | null = null;

export function getChatManager() {
  if (!_chatManager) {
    _chatManager = new ChatManager();
  }

  return _chatManager;
}
