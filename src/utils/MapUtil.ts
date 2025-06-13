import { AddLayerParam, IGeoJSONDatasource } from '@mapplus/react-native-webmap'
import { WebMapUtil } from '.'

/**
 * 添加数据源
 * @param datasourceDatas 
 * @returns 
 */
export const addDatasource = async (datasourceDatas: {
  content: string,
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
 * 新建图层
 * @param data 图层数据集
 * @returns 
 */
export const addLayer = async (data: IGeoJSONDatasource) => {
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
        sourceId: data.id,
        name: data.name,
        geometryType: 'point',
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
        sourceId: data.id,
        name: data.name,
        geometryType: 'line',
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
        sourceId: data.id,
        name: data.name,
        geometryType: 'fill',
        style: style,
      }
      metadata.layerType = params.type
      metadata.geometryType = params.geometryType
      break
    case 'text':
      // 文本图层
      params = {
        type: 'text',
        sourceId: data.id,
        name: data.name,
      }
      metadata.layerType = params.type
      break
  }
  if (params) {
    // 新建图层
    const layerId = await webmap.layers.add(params)
    return layerId
  } else {
    return undefined
  }
}