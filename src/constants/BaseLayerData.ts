/*
 * @Author: Yang Shang Long
 * @Date: 2024-02-20 14:03:40
 * @LastEditors: xiezhiyan 16297996+xiezhiyan@users.noreply.github.com
 * @Description: 底图数据
 *
 * Copyright (c) 2024 by SuperMap, All Rights Reserved.
 */
import {
  IGeoJSONDatasource,
  IRasterTileDatasource,
} from '@mapplus/react-native-webmap';
import { getAssets } from '../assets';
import { WebMapUtil } from '../utils';

export interface BaseLayerItem {
  title: string;
  image: string;
  action: () => Promise<(IGeoJSONDatasource | IRasterTileDatasource | any)[]>;
}

let baseLayerToContext: ((data?: BaseLayerItem) => void) | undefined =
  undefined;
export const setBaseLayerToContext = (
  action: ((data?: BaseLayerItem) => void) | undefined,
) => {
  baseLayerToContext = action;
};
export const getBaseLayerToContext = () => {
  return baseLayerToContext;
};

/** 天地图 */
const addTian = async () => {
  const webMap = WebMapUtil.getClient();
  if (!webMap) return [];
  await webMap.mapControl.setCRS('WebMercator');
  const data = await webMap.rasterTileProvider.getIServerTileimage(
    'https://service.mapplus.com/iserver/services/map-tianditu/rest/maps/矢量底图_墨卡托',
  );

  const result = await webMap.datasources.add({
    type: 'raster',
    name: '天地图',
    data: data,
  });
  const data2 = await webMap.rasterTileProvider.getIServerTileimage(
    'https://service.mapplus.com/iserver/services/map-tianditu/rest/maps/矢量中文注记_墨卡托',
    512,
    true,
  );

  const result2 = await webMap.datasources.add({
    type: 'raster',
    name: '天地图注记',
    data: data2,
  });
  const ds = result ? await webMap.datasources.getSource(result) : null;
  webMap.mapControl.refresh();
  return ds ? [ds] : [];
};

/** 天地图影像 */
const addTianImage = async () => {
  const webMap = WebMapUtil.getClient();
  if (!webMap) return [];
  const data = await webMap.rasterTileProvider.getIServerTileimage(
    'https://service.mapplus.com/iserver/services/map-tianditu/rest/maps/影像底图_墨卡托',
  );

  await webMap.mapControl.setCRS('WebMercator');
  const result = await webMap.datasources.add({
    type: 'raster',
    name: '天地图影像',
    data: data,
  });
  const ds = result ? await webMap.datasources.getSource(result) : null;
  webMap.mapControl.refresh();
  return ds ? [ds] : [];
};

/** 天地图地形 */
const addTianTerrain = async () => {
  const webMap = WebMapUtil.getClient();
  if (!webMap) return [];
  // const data = await webMap.rasterTileProvider.getIServerTileimage('https://service.mapplus.com/iserver/services/map-tianditu/rest/maps/地形底图_墨卡托')
  const data = await webMap.rasterTileProvider.getIServerTileimage(
    'https://service.mapplus.com/iserver/services/map-tianditu/rest/maps/地形底图_墨卡托',
  );

  await webMap.mapControl.setCRS('WebMercator');
  const result = await webMap.datasources.add({
    type: 'raster',
    name: '天地图地形',
    data: data,
  });
  const ds = result ? await webMap.datasources.getSource(result) : null;
  webMap.mapControl.refresh();
  return ds ? [ds] : [];
};

/** 高德图 */
const addGaode = async () => {
  const webMap = WebMapUtil.getClient();
  if (!webMap) return [];
  // const data = await webMap.rasterTileProvider.getIServerTileimage('https://service.mapplus.com/iserver/services/map-gaode-3857-vec-zh-small/rest/maps/gaode-3857-vec-zh-small')
  const data = {
    tiles: [
      'https://webrd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8',
      // 'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=24&style=8&x={x}&y={y}&z={z}',
    ],
    tileSize: 256,
  };
  await webMap.mapControl.setCRS('WebMercator', 'GCJ02');
  const result = await webMap.datasources.add({
    type: 'raster',
    name: '高德地图',
    data: data,
  });
  const ds = await webMap.datasources.getSource(result || '');
  webMap.mapControl.refresh();
  return ds ? [ds] : [];
};

/** 高德影像 */
const addGaodeImage = async () => {
  const webMap = WebMapUtil.getClient();
  if (!webMap) return [];
  const data = await webMap.rasterTileProvider.getIServerTileimage(
    'https://service.mapplus.com/iserver/services/map-gaode-3857-img/rest/maps/gaode-3857-img',
  );

  await webMap.mapControl.setCRS('WebMercator', 'GCJ02');
  const result = await webMap.datasources.add({
    type: 'raster',
    name: '高德影像地图',
    data: data,
  });
  const ds = result ? await webMap.datasources.getSource(result) : null;
  webMap.mapControl.refresh();
  return ds ? [ds] : [];
};

/** 腾讯地图 */
const addTX = async () => {
  const webMap = WebMapUtil.getClient();
  if (!webMap) return [];
  const data = await webMap.rasterTileProvider.getIServerTileimage(
    'https://service.mapplus.com/iserver/services/map-tengxun-3857-vec/rest/maps/tengxun-3857-vec',
  );

  await webMap.mapControl.setCRS('WebMercator', 'GCJ02');
  const result = await webMap.datasources.add({
    type: 'raster',
    name: '腾讯地图',
    data: data,
  });
  const ds = result ? await webMap.datasources.getSource(result) : null;
  webMap.mapControl.refresh();
  return ds ? [ds] : [];
};

/** 腾讯影像 */
const addTXImage = async () => {
  const webMap = WebMapUtil.getClient();
  if (!webMap) return [];
  const data = await webMap.rasterTileProvider.getIServerTileimage(
    'https://service.mapplus.com/iserver/services/map-tengxun-3857-img/rest/maps/tengxun-3857-img',
  );

  await webMap.mapControl.setCRS('WebMercator', 'GCJ02');
  const result = await webMap.datasources.add({
    type: 'raster',
    name: '腾讯影像',
    data: data,
  });
  const ds = result ? await webMap.datasources.getSource(result) : null;
  webMap.mapControl.refresh();
  return ds ? [ds] : [];
};

/** 腾讯暗色 */
const addTXDark = async () => {
  const webMap = WebMapUtil.getClient();
  if (!webMap) return [];
  const data = await webMap.rasterTileProvider.getIServerTileimage(
    'https://service.mapplus.com/iserver/services/map-tengxun-3857-vec-dark/rest/maps/tengxun-3857-vec-dark',
  );

  await webMap.mapControl.setCRS('WebMercator', 'GCJ02');
  const result = await webMap.datasources.add({
    type: 'raster',
    name: '暗色地图',
    data: data,
  });
  const ds = result ? await webMap.datasources.getSource(result) : null;
  webMap.mapControl.refresh();
  return ds ? [ds] : [];
};

/** 腾讯亮色 */
const addTXLight = async () => {
  const webMap = WebMapUtil.getClient();
  if (!webMap) return [];
  const data = await webMap.rasterTileProvider.getIServerTileimage(
    'https://service.mapplus.com/iserver/services/map-tengxun-3857-vec-warm-prominent/rest/maps/tengxun-3857-vec-warm-prominent',
  );

  await webMap.mapControl.setCRS('WebMercator', 'GCJ02');
  const result = await webMap.datasources.add({
    type: 'raster',
    name: '亮色地图',
    data: data,
  });
  const ds = result ? await webMap.datasources.getSource(result) : null;
  webMap.mapControl.refresh();
  return ds ? [ds] : [];
};

/** 腾讯地形 */
const addTXTerrain = async () => {
  const webMap = WebMapUtil.getClient();
  if (!webMap) return [];
  const data = await webMap.rasterTileProvider.getIServerTileimage(
    'https://service.mapplus.com/iserver/services/map-tengxun-3857-dem/rest/maps/tengxun-3857-dem',
  );

  await webMap.mapControl.setCRS('WebMercator', 'GCJ02');
  const result = await webMap.datasources.add({
    type: 'raster',
    name: '腾讯地形',
    data: data,
  });
  const ds = result ? await webMap.datasources.getSource(result) : null;
  webMap.mapControl.refresh();
  return ds ? [ds] : [];
};

const vectorData: BaseLayerItem[] = [
  {
    title: '高德地图',
    image: getAssets().bg_base_gaode_layer,
    action: addGaode,
  },
  {
    title: '天地图',
    image: getAssets().bg_base_tianditu_layer,
    action: addTian,
  },
  {
    title: '腾讯地图',
    image: getAssets().bg_base_tx_layer,
    action: addTX,
  },
  {
    title: '暗色地图',
    image: getAssets().bg_base_tx_dark_layer,
    action: addTXDark,
  },
  {
    title: '亮色地图',
    image: getAssets().bg_base_tx_light_layer,
    action: addTXLight,
  },
];

const imageData: BaseLayerItem[] = [
  {
    title: '高德影像地图',
    image: getAssets().bg_base_gaode_image_layer,
    action: addGaodeImage,
  },
  {
    title: '天地图地形',
    image: getAssets().bg_base_tianditu_terrain_layer,
    action: addTianTerrain,
  },
  {
    title: '天地图影像',
    image: getAssets().bg_base_tianditu_image_layer,
    action: addTianImage,
  },
  {
    title: '腾讯',
    image: getAssets().bg_base_tx_image_layer,
    action: addTX,
  },
  {
    title: '腾讯影像',
    image: getAssets().bg_base_tx_image_layer,
    action: addTXImage,
  },
  {
    title: '腾讯地形',
    image: getAssets().bg_base_tx_terrain_layer,
    action: addTXTerrain,
  },
];

export default {
  image: imageData,
  vector: vectorData,
};
