import { Coordsys, IGeoJSONData } from '@mapplus/react-native-webmap';
import { WebMapUtil } from '.';

/**
 * 随机颜色
 * @returns 
 */
export const randomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
 * 获取范围内随机整数
 * @param min 
 * @param max 
 * @returns 
 */
export function getRandomIntInclusive(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 坐标转换为地图坐标
 * @param geo 
 * @returns 
 */
export const transGeoByCRS = async (geo: IGeoJSONData, from: Coordsys, to: Coordsys) => {
  const client = WebMapUtil.getClient()
  if (!client) return geo
  const map = await client.mapControl.getMap()
  let result = geo
  if (map.crs === 'gcj02') {
    result = await client.coordTrans.translateGeoJSON(geo, from, to)
  }
  return result
}