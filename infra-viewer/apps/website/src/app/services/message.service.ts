import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private _messages: Message[] = [];

  public setMessage(error: Error) {
    const mappedError = this.mapError(error)
    this._messages.push(mappedError)
    setTimeout(() => {
      this._messages.shift()
    }, 5000)
  }

  public getMessages(): Message[] {
    return this._messages
  }

  /**
   * Map an incoming error to a message object. If the incoming error is already a message, it will be returned as is.
   * @param {Error | Message} message
   * @returns {Message}
   * @private
   */
  private mapError(message: Error | Message): Message {
    if (message instanceof Message) {
      return message
    }
    return new Message('error', message.message)
  }
}

/**
 * A class to transport custom messages through the application, which will be shown to the user.
 */
export class Message extends Error {
  constructor(
    public severity: 'error' | 'warning' | 'info' | 'success',
    message: string,
    public action?: () => void
  ) {
    super(message);
  }
}
