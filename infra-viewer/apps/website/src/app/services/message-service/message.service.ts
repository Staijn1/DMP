import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class MessageService {
  private _messages: Message[] = [];

  /**
   * Set a message to be shown to the user
   * Map the error to a message object if it is not already a message object
   * Returns the mapped error
   * @param {Error} error
   * @returns {Message}
   */
  public setMessage(error: Error): Message {
    const mappedError = this.mapError(error);
    this._messages.push(mappedError);
    setTimeout(() => {
      this._messages.shift();
    }, 5000);
    return mappedError;
  }

  public getMessages(): Message[] {
    return this._messages;
  }

  /**
   * Map an incoming error to a message object. If the incoming error is already a message, it will be returned as is.
   * @param {Error | Message} message
   * @returns {Message}
   * @private
   */
  private mapError(message: Error | Message): Message {
    if (message instanceof Message) {
      return message;
    }
    return new Message("error", message.message);
  }
}

/**
 * A class to transport custom messages through the application, which will be shown to the user.
 */
export class Message extends Error {
  constructor(
    public severity: "error" | "warning" | "info" | "success",
    message: string,
    public action?: () => void
  ) {
    super(message);
  }
}
