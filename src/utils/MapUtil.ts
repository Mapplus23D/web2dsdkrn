import {
  AddLayerParam,
  IGeometryType,
  IWebMap,
} from '@mapplus/react-native-webmap';
import { ToolRefs, WebMapUtil } from '.';
import BaseLayerData from '../constants/BaseLayerData';

/**
 * 新建图层
 * @param data 图层数据集
 * @returns
 */
export const addLayer = async (data: {
  /** 图层类型 */
  geometryType: IGeometryType;
  /** 数据源id */
  dsId: string;
  /** 图层名称 */
  name: string;
}) => {
  const webmap = WebMapUtil.getClient();
  if (!webmap) return;
  let params: AddLayerParam | undefined = undefined;
  let metadata: { [key: string]: any } = {
    editable: true,
    selectable: true,
    isBaseLayer: false,
  };

  let style;
  switch (data.geometryType) {
    case 'point':
      // 点图层
      style = {
        circleRadius: 6,
        circleColor: '#0064FF',
        circleOutlineWidth: 2,
        circleOutlineColor: '#FFFFFF',
      };
      params = {
        type: 'vector',
        sourceId: data.dsId,
        name: data.name,
        geometryType: data.geometryType,
        style: style,
      };
      metadata.layerType = params.type;
      metadata.geometryType = params.geometryType;
      break;
    case 'line': {
      // 线图层
      style = {
        lineColor: '#0064ff',
        lineWidth: 3,
      };
      params = {
        type: 'vector',
        sourceId: data.dsId,
        name: data.name,
        geometryType: data.geometryType,
        style: style,
      };
      metadata.layerType = params.type;
      metadata.geometryType = params.geometryType;
      break;
    }
    case 'fill':
      // 面图层
      style = {
        fillColor: '#0064ff44',
        fillOutlineColor: '#0064FF',
        fillOutlineWidth: 2,
      };
      params = {
        type: 'vector',
        sourceId: data.dsId,
        name: data.name,
        geometryType: data.geometryType,
        style: style,
      };
      metadata.layerType = params.type;
      metadata.geometryType = params.geometryType;
      break;
    case 'text':
      // 文本图层
      params = {
        type: data.geometryType,
        sourceId: data.dsId,
        name: data.name,
      };
      metadata.layerType = params.type;
      break;
  }
  if (params) {
    // 新建图层
    const layerId = await webmap.layers.add(params);
    webmap.mapControl.refresh();
    return layerId;
  } else {
    return undefined;
  }
};

/**
 * 初始化默认底图
 * @returns
 */
export const initDefaultLayer = async () => {
  const client = WebMapUtil.getClient();
  if (!client) return false;

  // 添加默认底图
  const dss = await BaseLayerData.image[0].action();
  for (const ds of dss) {
    ds &&
      (await client.baseLayers.add({
        sourceId: ds.id,
        name: ds.name,
        type: 'image',
      }));
  }
  return true;
};

/**
 * 关闭当前地图，并添加默认底图
 * @returns
 */
export const closeMap = async () => {
  const client = WebMapUtil.getClient();
  if (!client) return false;

  await client.mapControl.closeMap();

  // 添加默认底图
  await initDefaultLayer();
  return true;
};
