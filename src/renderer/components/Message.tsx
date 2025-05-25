import Markdown from "react-markdown";
import questionIcon from "../images/icons/question.png";
import defaultClippy from "../images/animations/Default.png";
import { MessageRecord } from "../../types/interfaces";

export interface Message extends MessageRecord {
  id: string;
  content?: string;
  children?: React.ReactNode;
  createdAt: number;
  sender: "user" | "clippy";
}

export function Message({ message }: { message: Message }) {
  return (
    <div
      className="message"
      style={{ display: "flex", alignItems: "flex-start" }}
    >
      <img
        src={message.sender === "user" ? questionIcon : defaultClippy}
        alt={`${message.sender === "user" ? "You" : "Clippy"}`}
        style={{ width: "24px", height: "24px", marginRight: "8px" }}
      />
      <div className="message-content">
        {message.children ? (
          message.children
        ) : (
          <Markdown
            components={{
              a: ({ node, ...props }) => (
                <a target="_blank" rel="noopener noreferrer" {...props} />
              ),
            }}
          >
            {message.content}
          </Markdown>
        )}
      </div>
    </div>
  );
}
