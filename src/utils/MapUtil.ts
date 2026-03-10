import { AddLayerParam, IGeometryType, IWebMap } from '@mapplus/react-native-webmap'
import { ToolRefs, WebMapUtil } from '.'
import BaseLayerData from '../constants/BaseLayerData'
import NativeHTools from '../specs/v1/NativeHTools'



/**
 * 新建图层
 * @param data 图层数据集
 * @returns 
 */
export const addLayer = async (data: {
  /** 图层类型 */
  geometryType: IGeometryType
  /** 数据源id */
  dsId: string
  /** 图层名称 */
  name: string
}) => {
  const webmap = WebMapUtil.getClient()
  if (!webmap) return
  let params: AddLayerParam | undefined = undefined
  let metadata: { [key: string]: any } = {
    editable: true,
    selectable: true,
    isBaseLayer: false,
  }

  let style
  switch (data.geometryType) {
    case 'point':
      // 点图层
      style = {
        circleRadius: 6,
        circleColor: '#0064FF',
        circleOutlineWidth: 2,
        circleOutlineColor: '#FFFFFF',
      }
      params = {
        type: 'vector',
        sourceId: data.dsId,
        name: data.name,
        geometryType: data.geometryType,
        style: style,
      }
      metadata.layerType = params.type
      metadata.geometryType = params.geometryType
      break
    case 'line': {
      // 线图层
      style = {
        lineColor: '#0064ff',
        lineWidth: 3,
      }
      params = {
        type: 'vector',
        sourceId: data.dsId,
        name: data.name,
        geometryType: data.geometryType,
        style: style,
      }
      metadata.layerType = params.type
      metadata.geometryType = params.geometryType
      break
    }
    case 'fill':
      // 面图层
      style = {
        fillColor: '#0064ff44',
        fillOutlineColor: '#0064FF',
        fillOutlineWidth: 2,
      }
      params = {
        type: 'vector',
        sourceId: data.dsId,
        name: data.name,
        geometryType: data.geometryType,
        style: style,
      }
      metadata.layerType = params.type
      metadata.geometryType = params.geometryType
      break
    case 'text':
      // 文本图层
      params = {
        type: data.geometryType,
        sourceId: data.dsId,
        name: data.name,
      }
      metadata.layerType = params.type
      break
  }
  if (params) {
    // 新建图层
    const layerId = await webmap.layers.add(params)
    webmap.mapControl.refresh()
    return layerId
  } else {
    return undefined
  }
}

/**
 * 打开地图
 */
export const openMap = async () => {
  return new Promise((resolve) => {
    // 打开本地文件管理器，选择地图文件
    // 二维地图文件是json格式
    NativeHTools?.openDoc({
      fileSuffixFilters: ['文档|json'],
      // 默认文件路径
      defaultFilePathUri: 'file://docs/storage/Users/currentUser/test',
      maxSelectNumber: 1,
    }).then(async (files) => {
      const client = WebMapUtil.getClient()
      if (!client || files.length <= 0) {
        resolve(false)
        return
      }
      ToolRefs.getLoading()?.setLoading(true, {
        info: '正在打开地图...',
      })

      try {
        // 读取文件
        const content = await NativeHTools?.readFile(files[0])

        if (!content) {
          resolve(false)
          return
        }

        // 地图数据字符串转成对象
        const mapJson = JSON.parse(content) as IWebMap

        // 打开地图
        await client.mapControl.openMap(mapJson)

        ToolRefs.getLoading()?.setLoading(false)
        resolve(true)

      } catch (error) {
        ToolRefs.getLoading()?.setLoading(false)
        resolve(false)
      }
    })
  })
}

/**
 * 保存地图
 * @returns 
 */
export const saveMap = async () => {
  return new Promise(async (resolve) => {
    const client = WebMapUtil.getClient()
    if (!client) {
      resolve(true)
      return
    }
    const map = await client.mapControl.getMap()
    NativeHTools?.openDocSave({
      // 默认文件路径
      defaultFilePathUri: 'file://docs/storage/Users/currentUser/test',
      newFileNames: ['Map_' + new Date().getTime()],
      fileSuffixChoices: ['.json'],
    }).then(async (files) => {
      NativeHTools?.writeFile(files[0], JSON.stringify(map)).then((res) => {
        if (res) {
          ToolRefs.getToast()?.show('地图已保存到：' + files[0], 3000)
          resolve(true)
        } else {
          ToolRefs.getToast()?.show('地图保存失败')
          resolve(false)
        }
      })
    })
  })
}

/**
 * 初始化默认底图
 * @returns 
 */
export const initDefaultLayer = async () => {
  const client = WebMapUtil.getClient()
  if (!client) return false

  // 添加默认底图
  const dss = await BaseLayerData.image[0].action()
  for (const ds of dss) {
    ds && await client.baseLayers.add({
      sourceId: ds.id,
      name: ds.name,
      type: 'image'
    })
  }
  return true
}


/**
 * 关闭当前地图，并添加默认底图
 * @returns 
 */
export const closeMap = async () => {
  const client = WebMapUtil.getClient()
  if (!client) return false

  await client.mapControl.closeMap()

  // 添加默认底图
  await initDefaultLayer()
  return true
}
