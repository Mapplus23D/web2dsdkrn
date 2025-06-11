/*
 * @Author: Yang Shang Long
 * @Date: 2024-02-20 14:03:40
 * @LastEditors: yangshanglong yangshanglong@supermap.com
 * @Description: 底图数据
 * 
 * Copyright (c) 2024 by SuperMap, All Rights Reserved. 
 */
import { Coordsys, IGeoJSONDatasource, INativeRasterData, IRasterTileDatasource } from '@mapplus/react-native-webmap'
import { getAssets } from '../assets'
import { WebMapUtil } from '../utils'

export interface BaseLayerItem {
  title: string
  image: string
  prjType: Coordsys
  action: () => Promise<(IGeoJSONDatasource | IRasterTileDatasource | null)[]>
}

let baseLayerToContext: ((data?: BaseLayerItem) => void) | undefined = undefined
export const setBaseLayerToContext = (action: ((data?: BaseLayerItem) => void) | undefined) => {
  baseLayerToContext = action
}
export const getBaseLayerToContext = () => {
  return baseLayerToContext
}

/** Bing地图 */
const addBing = async () => {
  const webMap = WebMapUtil.getClient()
  if (!webMap) return []

  const geovis = await webMap.rasterTileProvider.getIServerTileimage('https://service.mapplus.com/iserver/services/map-bingmap-img/rest/maps/Img')

  const result = await webMap.datasources.add({
    type: 'raster',
    name: 'Bing影像',
    data: geovis,
  })
  const ds = result ? await webMap.datasources.getSource(result) : null
  webMap.mapControl.setPrjCoordsys('wgs84')
  webMap.mapControl.refresh()
  return ds ? [ds] : []
}

/** 长光卫星 */
const addJilin = async () => {
  const webMap = WebMapUtil.getClient()
  if (!webMap) return []
  const siwei = await webMap.rasterTileProvider.getJl1(
    '2d9bf902749f1630bc25fc720ba7c29f',
    '874c67e3bdab293579415db1da04f922',
  ) as INativeRasterData

  if (siwei?.tiles && siwei.tiles.length > 0) {
    siwei.tiles = siwei.tiles.map(url => {
      return url.replace('http://', 'https://')
    })
  }
  const result = await webMap.datasources.add({
    type: 'raster',
    name: '长光卫星',
    data: siwei,
  })
  const ds = result ? await webMap.datasources.getSource(result) : null
  webMap.mapControl.setPrjCoordsys('wgs84')
  webMap.mapControl.refresh()
  return ds ? [ds] : []
}

/** 天地图 */
const addTian = async () => {
  const webMap = WebMapUtil.getClient()
  if (!webMap) return []
  const data = await webMap.rasterTileProvider.getIServerTileimage('https://service.mapplus.com/iserver/services/map-tianditu/rest/maps/矢量底图_墨卡托')

  const result = await webMap.datasources.add({
    type: 'raster',
    name: '天地图',
    data: data,
  })
  const data2 = await webMap.rasterTileProvider.getIServerTileimage('https://service.mapplus.com/iserver/services/map-tianditu/rest/maps/矢量中文注记_墨卡托', 512, true)

  const result2 = await webMap.datasources.add({
    type: 'raster',
    name: '天地图注记',
    data: data2,
  })
  const ds = result ? await webMap.datasources.getSource(result) : null
  webMap.mapControl.setPrjCoordsys('wgs84')
  webMap.mapControl.refresh()
  return ds ? [ds] : []
}

/** 天地图影像 */
const addTianImage = async () => {
  const webMap = WebMapUtil.getClient()
  if (!webMap) return []
  const data = await webMap.rasterTileProvider.getIServerTileimage('https://service.mapplus.com/iserver/services/map-tianditu/rest/maps/影像底图_墨卡托')

  const result = await webMap.datasources.add({
    type: 'raster',
    name: '天地图影像',
    data: data,
  })
  const ds = result ? await webMap.datasources.getSource(result) : null
  webMap.mapControl.setPrjCoordsys('wgs84')
  webMap.mapControl.refresh()
  return ds ? [ds] : []
}

/** 天地图地形 */
const addTianTerrain = async () => {
  const webMap = WebMapUtil.getClient()
  if (!webMap) return []
  // const data = await webMap.rasterTileProvider.getIServerTileimage('https://service.mapplus.com/iserver/services/map-tianditu/rest/maps/地形底图_墨卡托')
  const data = await webMap.rasterTileProvider.getIServerTileimage('https://service.mapplus.com/iserver/services/map-tianditu/rest/maps/地形底图_墨卡托')

  const result = await webMap.datasources.add({
    type: 'raster',
    name: '天地图地形',
    data: data,
  })
  const ds = result ? await webMap.datasources.getSource(result) : null
  webMap.mapControl.setPrjCoordsys('wgs84')
  webMap.mapControl.refresh()
  return ds ? [ds] : []
}

/** 高德图 */
const addGaode = async () => {
  const webMap = WebMapUtil.getClient()
  if (!webMap) return []
  // const data = await webMap.rasterTileProvider.getIServerTileimage('https://service.mapplus.com/iserver/services/map-gaode-3857-vec-zh-small/rest/maps/gaode-3857-vec-zh-small')
  const data = {
    tiles: [
      'https://webrd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8',
      // 'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=24&style=8&x={x}&y={y}&z={z}',
    ],
    tileSize: 256,
  }
  const result = await webMap.datasources.add({
    type: 'raster',
    name: '高德地图',
    data: data,
  })
  const ds = await webMap.datasources.getSource(result || '')
  webMap.mapControl.setPrjCoordsys('gcj02')
  webMap.mapControl.refresh()
  return ds ? [ds] : []
}

/** 高德影像 */
const addGaodeImage = async () => {
  const webMap = WebMapUtil.getClient()
  if (!webMap) return []
  const data = await webMap.rasterTileProvider.getIServerTileimage('https://service.mapplus.com/iserver/services/map-gaode-3857-img/rest/maps/gaode-3857-img')
  const result = await webMap.datasources.add({
    type: 'raster',
    name: '高德影像地图',
    data: data,
  })
  const ds = result ? await webMap.datasources.getSource(result) : null
  webMap.mapControl.setPrjCoordsys('gcj02')
  webMap.mapControl.refresh()
  return ds ? [ds] : []
}

/** 百度地图 */
const addBaidu = async () => {
  const webMap = WebMapUtil.getClient()
  if (!webMap) return []
  // const data = await webMap.rasterTileProvider.getBDVector()
  const data = await webMap.rasterTileProvider.getIServerTileimage('https://service.mapplus.com/iserver/services/map-baidu/rest/maps/normal')

  const result = await webMap.datasources.add({
    type: 'raster',
    name: '百度地图',
    data: data,
  })
  const ds = result ? await webMap.datasources.getSource(result) : null
  webMap.mapControl.setPrjCoordsys('bd09')
  webMap.mapControl.refresh()
  return ds ? [ds] : []
}

/** 百度影像 */
const addBaiduImage = async () => {
  const webMap = WebMapUtil.getClient()
  if (!webMap) return []
  const data = await webMap.rasterTileProvider.getIServerTileimage('https://service.mapplus.com/iserver/services/map-baidu/rest/maps/satellite')

  const result = await webMap.datasources.add({
    type: 'raster',
    name: '百度影像地图',
    data: data,
  })
  const ds = result ? await webMap.datasources.getSource(result) : null
  webMap.mapControl.setPrjCoordsys('bd09')
  webMap.mapControl.refresh()
  return ds ? [ds] : []
}

/** 星球地图 */
const addGeovis = async () => {
  const webMap = WebMapUtil.getClient()
  if (!webMap) return []
  const geovis = await webMap.rasterTileProvider.getIServerTileimage('https://service.mapplus.com/iserver/services/map-geovis-img/rest/maps/GEOVIS_Img')

  const result = await webMap.datasources.add({
    type: 'raster',
    name: '星球',
    data: geovis,
  })
  const ds = result ? await webMap.datasources.getSource(result) : null
  webMap.mapControl.setPrjCoordsys('wgs84')
  webMap.mapControl.refresh()
  return ds ? [ds] : []
}

/** 四维地图 */
const add4D = async () => {
  const webMap = WebMapUtil.getClient()
  if (!webMap) return []
  const fourD = await webMap.rasterTileProvider.getIServerTileimage('https://service.mapplus.com/iserver/services/map-siweidata-3857/rest/maps/siweiearth3857')

  const result = await webMap.datasources.add({
    type: 'raster',
    name: '四维',
    data: fourD,
  })
  const ds = result ? await webMap.datasources.getSource(result) : null
  webMap.mapControl.setPrjCoordsys('wgs84')
  webMap.mapControl.refresh()
  return ds ? [ds] : []
}

/** 腾讯地图 */
const addTX = async () => {
  const webMap = WebMapUtil.getClient()
  if (!webMap) return []
  const data = await webMap.rasterTileProvider.getIServerTileimage('https://service.mapplus.com/iserver/services/map-tengxun-3857-vec/rest/maps/tengxun-3857-vec')

  const result = await webMap.datasources.add({
    type: 'raster',
    name: '腾讯地图',
    data: data,
  })
  const ds = result ? await webMap.datasources.getSource(result) : null
  webMap.mapControl.setPrjCoordsys('gcj02')
  webMap.mapControl.refresh()
  return ds ? [ds] : []
}

/** 腾讯影像 */
const addTXImage = async () => {
  const webMap = WebMapUtil.getClient()
  if (!webMap) return []
  const data = await webMap.rasterTileProvider.getIServerTileimage('https://service.mapplus.com/iserver/services/map-tengxun-3857-img/rest/maps/tengxun-3857-img')

  const result = await webMap.datasources.add({
    type: 'raster',
    name: '腾讯影像',
    data: data,
  })
  const ds = result ? await webMap.datasources.getSource(result) : null
  webMap.mapControl.setPrjCoordsys('gcj02')
  webMap.mapControl.refresh()
  return ds ? [ds] : []
}

/** 腾讯暗色 */
const addTXDark = async () => {
  const webMap = WebMapUtil.getClient()
  if (!webMap) return []
  const data = await webMap.rasterTileProvider.getIServerTileimage('https://service.mapplus.com/iserver/services/map-tengxun-3857-vec-dark/rest/maps/tengxun-3857-vec-dark')

  const result = await webMap.datasources.add({
    type: 'raster',
    name: '暗色地图',
    data: data,
  })
  const ds = result ? await webMap.datasources.getSource(result) : null
  webMap.mapControl.setPrjCoordsys('gcj02')
  webMap.mapControl.refresh()
  return ds ? [ds] : []
}

/** 腾讯亮色 */
const addTXLight = async () => {
  const webMap = WebMapUtil.getClient()
  if (!webMap) return []
  const data = await webMap.rasterTileProvider.getIServerTileimage('https://service.mapplus.com/iserver/services/map-tengxun-3857-vec-warm-prominent/rest/maps/tengxun-3857-vec-warm-prominent')

  const result = await webMap.datasources.add({
    type: 'raster',
    name: '亮色地图',
    data: data,
  })
  const ds = result ? await webMap.datasources.getSource(result) : null
  webMap.mapControl.setPrjCoordsys('gcj02')
  webMap.mapControl.refresh()
  return ds ? [ds] : []
}

/** 腾讯地形 */
const addTXTerrain = async () => {
  const webMap = WebMapUtil.getClient()
  if (!webMap) return []
  const data = await webMap.rasterTileProvider.getIServerTileimage('https://service.mapplus.com/iserver/services/map-tengxun-3857-dem/rest/maps/tengxun-3857-dem')

  const result = await webMap.datasources.add({
    type: 'raster',
    name: '腾讯地形',
    data: data,
  })
  const ds = result ? await webMap.datasources.getSource(result) : null
  webMap.mapControl.setPrjCoordsys('gcj02')
  webMap.mapControl.refresh()
  return ds ? [ds] : []
}

const vectorData: BaseLayerItem[] = [
  {
    title: '高德地图',
    image: getAssets().bg_base_gaode_layer,
    action: addGaode,
    prjType: 'gcj02',
  },
  {
    title: '天地图',
    image: getAssets().bg_base_tianditu_layer,
    action: addTian,
    prjType: 'wgs84',
  },
  // {
  //   title: 'Bing地图',
  //   image: getAssets().bg_base_minedata_img_layer,
  //   action: addBing,
  // },
  {
    title: '腾讯地图',
    image: getAssets().bg_base_tx_layer,
    action: addTX,
    prjType: 'gcj02',
  },
  {
    title: '暗色地图',
    image: getAssets().bg_base_tx_dark_layer,
    action: addTXDark,
    prjType: 'gcj02',
  },
  {
    title: '亮色地图',
    image: getAssets().bg_base_tx_light_layer,
    action: addTXLight,
    prjType: 'gcj02',
  },
]

const imageData: BaseLayerItem[] = [
  {
    title: '高德影像地图',
    image: getAssets().bg_base_gaode_image_layer,
    action: addGaodeImage,
    prjType: 'gcj02',
  },
  {
    title: '天地图地形',
    image: getAssets().bg_base_tianditu_terrain_layer,
    action: addTianTerrain,
    prjType: 'wgs84',
  },
  {
    title: '天地图影像',
    image: getAssets().bg_base_tianditu_image_layer,
    action: addTianImage,
    prjType: 'wgs84',
  },
  {
    title: 'Bing影像',
    image: getAssets().bg_base_minedata_img_layer,
    action: addBing,
    prjType: 'wgs84',
  },
  {
    title: '腾讯影像',
    image: getAssets().bg_base_tx_image_layer,
    action: addTXImage,
    prjType: 'gcj02',
  },
  {
    title: '腾讯地形',
    image: getAssets().bg_base_tx_terrain_layer,
    action: addTXTerrain,
    prjType: 'gcj02',
  },
]

export default {
  image: imageData,
  vector: vectorData,
}