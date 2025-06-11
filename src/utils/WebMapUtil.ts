import { Client } from '@mapplus/react-native-webmap';

let client: Client | null = null;

/**
 * 获取sdk实例
 * @returns 
 */
export function getClient(): Client | null {
  return client
}

/**
 * 设置获取sdk实例
 * @param _client 
 */
export function setClient(_client: Client | null) {
  client = _client
}