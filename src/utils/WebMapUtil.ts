/*
 * @Author: xiezhiyan 16297996+xiezhiyan@users.noreply.github.com
 * @Date: 2025-08-12 14:34:31
 * @LastEditors: xiezhiyan 16297996+xiezhiyan@users.noreply.github.com
 * @LastEditTime: 2026-02-05 18:02:24
 * @FilePath: /web2dsdkrn/src/utils/WebMapUtil.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Client, ISymbolItem, ISymbolLibrary } from '@mapplus/react-native-webmap';

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
  const responseJson: ISymbolLibrary & {
    point2d?: { [key: string]: ISymbolItem[] }
  } = await response.json()
  return responseJson || {
    point2d: {},
    point: [],
    line: [],
    fill: [],
  }
}