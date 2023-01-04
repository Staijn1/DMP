import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class StorageService {
  /**
   * Store a value under a certain key
   * If the payload is an object, parse it to JSON first, otherwise save it directly
   * @param key
   * @param payload
   * @param storage
   */
  store(key: string, payload: string | object, storage: Storage = sessionStorage) {
    if (typeof payload === "object") {
      payload = JSON.stringify(payload);
    }
    storage.setItem(key, payload);
  }

  /**
   * Get a value from a storage by key.
   * If the key does not exist it returns null
   * If the key does exist, it tries to parse the JSON and if this fails (because of invalid JSON for example) it returns the unparsed value
   * @param key
   * @param storage
   */
  get(key: string, storage: Storage = sessionStorage): any | null {
    const value = storage.getItem(key);
    if (!value) return null;

    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
}
