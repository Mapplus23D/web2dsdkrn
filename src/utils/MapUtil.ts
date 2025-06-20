import { AddLayerParam, ExcelData, IGeoJSONData, IGeoJSONDatasource, IGeometryType } from '@mapplus/react-native-webmap'
import { WebMapUtil } from '.'
import NativeHTools from '../specs/v1/NativeHTools'

/**
 * 导入数据源
 * @param datasourceDatas 
 * @returns 
 */
export const importDatasource = async (datasourceDatas: {
  /** 导入数据源json字符串 */
  content: string,
  /** 数据源名称 */
  name: string
}[]) => {
  const webmap = WebMapUtil.getClient()
  if (!webmap) return
  let datasources: string[] = []
  if (datasourceDatas.length > 0) {
    for (let i = 0; i < datasourceDatas.length; i++) {
      const mapData: IGeoJSONDatasource = JSON.parse(datasourceDatas[i].content)
      const dsName = datasourceDatas[i].name
      const datas = await webmap.dataConverter.GeoJSONtoData(mapData.data)

      if (datas[0]) {
        let _data: string | null = null
        switch (datas[0].type) {
          case 'point':
            _data = await webmap.datasources.add({
              type: 'geojson',
              name: dsName,
              data: datas[0].data,
              geometryType: datas[0].type,
              fieldInfos: datas[0].fieldInfos,
            })
            _data && datasources.push(_data)
            break
          case 'line':
            _data = await webmap.datasources.add({
              type: 'geojson',
              name: dsName,
              data: datas[0].data,
              geometryType: datas[0].type,
              fieldInfos: datas[0].fieldInfos,
            })
            _data && datasources.push(_data)
            break
          case 'fill':
          default:
            _data = await webmap.datasources.add({
              type: 'geojson',
              name: dsName,
              data: datas[0].data,
              geometryType: datas[0].type,
              fieldInfos: datas[0].fieldInfos,
            })
            _data && datasources.push(_data)
            break
        }
      }
    }
  }
  return datasources
}

/**
 * 导入 GeoJSON 数据到指定图层
 * @param constent GeoJSON 数据内容 
 * @param dsName   数据源名称
 * @returns 
 */
export const importGeojson = async (content: IGeoJSONData, dsName: string) => {
  const webmap = WebMapUtil.getClient()
  if (!webmap || !content) return undefined
  const result = await webmap.dataConverter.GeoJSONtoData(content)

  const importResult: {
    datasourceID: string,
    geometryType: IGeometryType,
    layerName: string,
  }[] = []
  for (const item of result) {
    const ds = await webmap.datasources.add({
      type: 'geojson',
      name: dsName,
      data: {
        type: item.data.type || 'FeatureCollection',
        features: item.data.features,
      },
      fieldInfos: item.fieldInfos,
      geometryType: item.type,
    })
    if (ds) {
      const layerName = await addLayer({
        geometryType: item.type,
        dsId: ds,
        name: dsName,
      })
      layerName && ds && importResult.push({
        datasourceID: ds,
        geometryType: item.type,
        layerName: layerName,
      })
    }
  }
  return importResult.length > 0 ? importResult : undefined
}

/**
 * 读取Excel文件
 * @param filePath 
 * @returns 
 */
export const readExcel = async (filePath: string) => {
  const webmap = WebMapUtil.getClient()
  if (!webmap) return undefined
  const content = await NativeHTools?.readFile(filePath, 'base64')

  if (!content) return undefined

  const result = await webmap.dataConverter.readExcel(content, {
    firstLineAsFieldInfo: true,
  })
  return result
}

/**
 * 导入 Excel 数据到指定图层
 * @param params 
 * @returns 
 */
export const importExcel = async (params: {
  dsName: string,
  data: ExcelData,
  xName: string,
  yName: string
}) => {
  const webmap = WebMapUtil.getClient()
  if (!webmap) return undefined

  if (!params.xName || !params.yName) return undefined

  const reulst2 = await webmap.dataConverter.excelToData(params.data, {
    /** 导入类型，目前只有按坐标导入 */
    type: "coordinate",
    /** x 坐标所在列的字段名 */
    x: params.xName,
    /** y 坐标所在列的字段名 */
    y: params.yName,
  })
  if (!reulst2.success) return undefined
  try {
    const ds = await webmap.datasources.add({
      type: 'geojson',
      name: params.dsName,
      data: {
        type: 'FeatureCollection',
        features: reulst2.data.data.features,
      },
      fieldInfos: reulst2.data.fieldInfos,
      geometryType: reulst2.data.type,
    })
    if (ds) {
      return await addLayer({
        geometryType: reulst2.data.type,
        dsId: ds,
        name: params.dsName,
      })
    }
    return undefined
  } catch (error) {
    return undefined
  }
}


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