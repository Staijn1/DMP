import {Injectable} from '@angular/core';
import {Message, MessageService} from '../message-service/message.service';

@Injectable({
  providedIn: 'root',
})
export class HTTPService {
  constructor(private readonly messageService: MessageService) {
  }

  /**
   * Handle the error from the api and map it to an error we can show
   * @param {any} err
   * @private
   */
  private handleError(err: string | any): Message {
    return this.messageService.setMessage(err)
  }

  /**
   * Helper function to perform a request and handle the response with the error handler.
   * @param input - URL to fetch from
   * @param init - options with request
   */
  protected async request(input: string, init: RequestInit): Promise<any> {
    const response = await fetch(input, init);
    const text = await response.text();
    // If the text is valid json, parse it
    let data: any;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = text;
    }
    if (!response.ok || data.error) {
      throw this.handleError(data.error || data);
    }
    return data;
  }
}
