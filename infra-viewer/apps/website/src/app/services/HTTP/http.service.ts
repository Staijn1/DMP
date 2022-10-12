import {Injectable} from '@angular/core';
import {CustomError} from '@infra-viewer/interfaces';

@Injectable({
  providedIn: 'root',
})
export class HTTPService {
  /**
   * Handle the error from the api and map it to an error we can show
   * @param {any} err
   * @returns {CustomError}
   * @private
   */
  private handleError(err: string | any): CustomError {
    console.warn('Handle error not implemented');

    return err;
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
    if (!response.ok) {
      throw this.handleError(data);
    }
    return data;
  }
}
