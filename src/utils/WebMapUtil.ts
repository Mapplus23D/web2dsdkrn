import { Client } from '@mapplus/react-native-webmap';
import { SymbolItem } from 'src/types/types';

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

export async function getDefaultResources() {
  const url = `https://wwwcdn.mapplus.com/apps/mbs-earth/resource/symbol/files/symbols2d.json`
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'GET',
  })
  const responseJson: {
    point2d?: { [key: string]: SymbolItem[] }
    point: SymbolItem[],
    line: SymbolItem[],
    fill: SymbolItem[],
  } = await response.json()
  console.log(JSON.stringify(responseJson))
  return responseJson || {
    point2d: {},
    point: [],
    line: [],
    fill: [],
  }
}