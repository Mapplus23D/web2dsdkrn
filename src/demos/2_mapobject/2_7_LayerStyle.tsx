/**
 * 图层样式Demo
 *
 * 包含点、线、面图层样式修改
 *
 * 文本样式只能单个对象修改
 */
import {
  AddSourceParam,
  Client,
  IGeoJSONData,
  IGeoJSONFeature,
  IGeoJSONPoint,
  ILicenseInfo,
  ISymbolItem,
  RTNWebMap,
} from '@mapplus/react-native-webmap';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { getAssets } from '../../assets';
import { ImageButton, WebmapView } from '../../components';
import BaseLayerData from '../../constants/BaseLayerData';
import { DemoStackPageProps } from '../../navigators/types';
import { DataUtil, LicenseUtil, MapUtil, WebMapUtil } from '../../utils';

interface Props extends DemoStackPageProps<'LayerStyle'> {}

const TextLayer = 'text';
const PointLayer = 'point';
const LineLayer = 'line';
const RegionLayer = 'region';

/**
 * 对象编辑
 * @param props
 * @returns
 */
export default function LayerStyle(props: Props) {
  const [license, setLicense] = useState<ILicenseInfo | undefined>();
  const [clientUrl, setClientUrl] = useState<string | undefined>();

  const textLayerRef = useRef<
    | {
        dsId: string;
        layerId: string;
      }
    | undefined
  >(undefined);
  const pointLayerRef = useRef<
    | {
        dsId: string;
        layerId: string;
      }
    | undefined
  >(undefined);
  const lineLayerRef = useRef<
    | {
        dsId: string;
        layerId: string;
      }
    | undefined
  >(undefined);
  const regionLayerRef = useRef<
    | {
        dsId: string;
        layerId: string;
      }
    | undefined
  >(undefined);

  const symbolsRef = useRef<{
    point: ISymbolItem[];
    line: ISymbolItem[];
    fill: ISymbolItem[];
  }>({
    point: [],
    line: [],
    fill: [],
  });

  /** 激活许可 */
  const initLicense = () => {
    LicenseUtil.active().then(res => {
      setLicense(res);
    });
  };

  const onLoad = async (client: Client) => {
    WebMapUtil.setClient(client);
    // 初始化图层
    initLayers();
    const resources = await WebMapUtil.getDefaultResources();
    if (resources.fill) {
      for (const r of resources.fill) {
        await client.symbolLibrary.addFillSymbol(r.name, r.resource);
      }
    }
    if (resources.line) {
      for (const r of resources.line) {
        await client.symbolLibrary.addLineSymbol(r.name, r.resource);
      }
    }
    if (resources.point) {
      for (const r of resources.point) {
        await client.symbolLibrary.addPointSymbol(r.name, r.resource);
      }
    }
  };

  /**
   * 添加图层
   * @param params
   * @returns
   */
  const addLayer = async (params: AddSourceParam) => {
    const webmap = WebMapUtil.getClient();
    if (!webmap) return;

    let result:
      | {
          dsId: string;
          layerId: string;
        }
      | undefined = undefined;

    // 添加数据源
    const dsId = await webmap.datasources.add(params);

    if (dsId && params.type === 'geojson') {
      // 添加图层
      const layer = await MapUtil.addLayer({
        dsId,
        geometryType: params.geometryType,
        name: params.name,
      });
      if (layer) {
        result = {
          dsId,
          layerId: layer,
        };
      }
    }

    return result;
  };

  /** 添加文本图层 */
  const addDefaultTextLayer = async () => {
    const client = WebMapUtil.getClient();
    if (client) {
      return await addLayer({
        type: 'geojson',
        fieldInfos: [],
        geometryType: 'text',
        name: TextLayer,
      });
    }
    return undefined;
  };

  /** 添加点图层 */
  const addDefaultPointLayer = async () => {
    const client = WebMapUtil.getClient();
    if (client) {
      return await addLayer({
        type: 'geojson',
        fieldInfos: [],
        geometryType: 'point',
        name: PointLayer,
      });
    }
    return undefined;
  };

  /** 添加线图层 */
  const addDefaultLineLayer = async () => {
    const client = WebMapUtil.getClient();
    if (client) {
      return await addLayer({
        type: 'geojson',
        fieldInfos: [],
        geometryType: 'line',
        name: LineLayer,
      });
    }
    return undefined;
  };

  /** 添加面图层 */
  const addDefaultRegionLayer = async () => {
    const client = WebMapUtil.getClient();
    if (client) {
      return await addLayer({
        type: 'geojson',
        fieldInfos: [],
        geometryType: 'fill',
        name: RegionLayer,
      });
    }
    return undefined;
  };

  /**
   * 地图定位到当前位置
   */
  const flyToInitPosition = async () => {
    const client = WebMapUtil.getClient();
    if (!client) return;

    await client.mapControl.flyTo({
      center: {
        //经度
        x: 104.09197291173261,
        //维度
        y: 30.522202566573696,
      },
      duration: 1000,
      scale: 2.4911532365316153e-4,
    });
  };

  /** 初始化默认图层 */
  const initLayers = async () => {
    const client = WebMapUtil.getClient();
    if (!client) return;

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

    // 定位到初始位置
    flyToInitPosition();

    // 添加默认图层
    textLayerRef.current = await addDefaultTextLayer();
    pointLayerRef.current = await addDefaultPointLayer();
    lineLayerRef.current = await addDefaultLineLayer();
    regionLayerRef.current = await addDefaultRegionLayer();

    // 添加点、线、面、对象
    addText();
    addPoint();
    addLine();
    addRegion();
  };

  useEffect(() => {
    // 激活 sdk 许可
    initLicense();
    return () => {
      // 退出页面，关闭地图
      WebMapUtil.getClient()?.mapControl.closeMap();
      WebMapUtil.setClient(null);
    };
  }, []);

  useEffect(() => {
    if (license) {
      // 获取 sdk web 服务地址
      const res = RTNWebMap.getClientUrl();
      if (res) {
        setClientUrl(res);
      }
    }
  }, [license]);

  /**
   * 添加点
   */
  const addText = async () => {
    const client = WebMapUtil.getClient();
    if (!client || !textLayerRef.current) return;

    // 检查数据源是否存在
    const ds = await client.datasources.getSource(textLayerRef.current.dsId);
    if (!ds) return;

    // 检测图层是否存在
    const layer = await client.layers.getLayer(textLayerRef.current.layerId);
    if (!layer) return;

    if (ds?.type === 'geojson') {
      // 添加对象
      const result = await client.recordset.addNew(textLayerRef.current.dsId, {
        /** 文本 */
        text: '文本',
        type: 'text',
        textStyle: { textSize: 20, textColor: '#4680DF' },
        /** 文本位置 */
        point: [104.09197291173261, 30.523202566973696],
      });
    }
  };

  /**
   * 添加点
   */
  const addPoint = async () => {
    const client = WebMapUtil.getClient();
    if (!client || !pointLayerRef.current) return;

    // 检查数据源是否存在
    const ds = await client.datasources.getSource(pointLayerRef.current.dsId);
    if (!ds) return;

    // 检测图层是否存在
    const layer = await client.layers.getLayer(pointLayerRef.current.layerId);
    if (!layer) return;

    if (ds?.type === 'geojson') {
      const result = await client.recordset.addNew(pointLayerRef.current.dsId, {
        type: 'point',
        point: [104.09197291173261, 30.522202566573696],
      });
    }
  };

  /**
   * 添加线
   */
  const addLine = async () => {
    const client = WebMapUtil.getClient();
    if (!client || !lineLayerRef.current) return;

    // 检查数据源是否存在
    const ds = await client.datasources.getSource(lineLayerRef.current.dsId);
    if (!ds) return;

    // 检测图层是否存在
    const layer = await client.layers.getLayer(lineLayerRef.current.layerId);
    if (!layer) return;

    if (ds?.type === 'geojson') {
      const result = await client.recordset.addNew(lineLayerRef.current.dsId, {
        type: 'line',
        lines: [
          [
            [104.08859448400918, 30.520262722685803],
            [104.09134848951884, 30.521003289516923],
            [104.09306035594514, 30.52094314089782],
          ],
        ],
      });
    }
  };

  /**
   * 添加面
   */
  const addRegion = async () => {
    const client = WebMapUtil.getClient();
    if (!client || !regionLayerRef.current) return;

    // 检查数据源是否存在
    const ds = await client.datasources.getSource(regionLayerRef.current.dsId);
    if (!ds) return;

    // 检测图层是否存在
    const layer = await client.layers.getLayer(regionLayerRef.current.layerId);
    if (!layer) return;

    if (ds?.type === 'geojson') {
      const result = await client.recordset.addNew(
        regionLayerRef.current.dsId,
        {
          type: 'fill',
          regions: [
            [
              [
                [104.09041239594507, 30.522565980817113],
                [104.09039102991115, 30.52191151632133],
                [104.09126063326975, 30.521911503777226],
                [104.0912553009503, 30.522581351706652],
                [104.09041239594507, 30.522565980817113],
              ],
            ],
          ],
        },
      );
    }
  };

  /**
   * 修改图层样式
   * @returns
   */
  const changeStyle = async () => {
    const client = WebMapUtil.getClient();
    if (!client) return;

    if (regionLayerRef.current) {
      // 修改面样式
      client.layers.changeLayerStyle(regionLayerRef.current.layerId, {
        fillColor: DataUtil.randomColor(),
        fillOpacity: Math.random(),
        fillOutlineWidth: Math.random() * 10,
        fillOutlineColor: DataUtil.randomColor(),
      });
    }
    if (lineLayerRef.current) {
      // 修改线样式
      client.layers.changeLayerStyle(lineLayerRef.current.layerId, {
        // 线颜色
        lineColor: DataUtil.randomColor(),
        // 线宽。默认 1px
        lineWidth: Math.random() * 30,
        // 线不透明度。0 透明， 1 不透明
        lineOpacity: Math.random(),
      });
    }
    if (pointLayerRef.current) {
      const pointSymbols = await client.symbolLibrary.getPointSymbols();
      // 修改点样式
      client.layers.changeLayerStyle(pointLayerRef.current.layerId, {
        // 点颜色
        circleColor: DataUtil.randomColor(),
        // 纯色点轮廓颜色,默认白色
        circleOutlineColor: DataUtil.randomColor(),
        // 纯色轮廓宽度，单位像素，默认0px
        circleOutlineWidth: Math.random() * 10,
        // 点大小，单位像素，默认5px
        circleRadius: Math.random() * 5,
      });
    }
    if (textLayerRef.current) {
      // 修改点样式
      client.layers.changeTextStyle(textLayerRef.current.layerId, [0], {
        // 文本颜色
        textColor: DataUtil.randomColor(),
        // 字体大小 默认 16px
        textSize: Math.random() * 20 + 8,
        // 文本不透明度
        textOpacity: Math.random() * 10,
        // 旋转角度
        textRotate: Math.random() * 360,
      });
      client.layers.refresh(textLayerRef.current.layerId);
    }
  };

  /**
   * 修改符号
   * @returns
   */
  const changeSymbol = async (clear?: boolean) => {
    const client = WebMapUtil.getClient();
    if (!client) return;

    if (regionLayerRef.current) {
      const fillSymbols = await client.symbolLibrary.getFillSymbols();
      const lineSymbols = await client.symbolLibrary.getLineSymbols();
      // 修改面符号
      client.layers.changeLayerStyle(regionLayerRef.current.layerId, {
        fillSymbol: clear
          ? ''
          : fillSymbols[
              DataUtil.getRandomIntInclusive(0, fillSymbols.length - 1)
            ].id,
        fillOutlineSymbol: clear
          ? ''
          : lineSymbols[
              DataUtil.getRandomIntInclusive(0, lineSymbols.length - 1)
            ].id,
      });
    }
    if (lineLayerRef.current) {
      const symbols = await client.symbolLibrary.getLineSymbols();
      // 修改线符号
      client.layers.changeLayerStyle(lineLayerRef.current.layerId, {
        lineWidth: 30,
        lineSymbol: clear
          ? ''
          : symbols[DataUtil.getRandomIntInclusive(0, symbols.length - 1)].id,
      });
    }
    if (pointLayerRef.current) {
      const symbols = await client.symbolLibrary.getPointSymbols();
      // 修改点符号
      client.layers.changeLayerStyle(pointLayerRef.current.layerId, {
        circleSymbol: clear
          ? ''
          : symbols[DataUtil.getRandomIntInclusive(0, symbols.length - 1)].id,
      });
    }
  };

  /**
   * 侧边工具栏
   * @returns
   */
  const renderTools = () => {
    return (
      <View
        style={{
          position: 'absolute',
          top: 80,
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <View
          style={{
            width: '30%',
            marginLeft: 10,
          }}>
          <ImageButton
            style={styles.methodBtn}
            image={getAssets().icon_style_black}
            onPress={changeStyle}
            title="样式"
          />
          <ImageButton
            style={styles.methodBtn}
            image={getAssets().icon_symbol}
            onPress={changeSymbol}
            title="符号"
          />
          <ImageButton
            style={styles.methodBtn}
            image={getAssets().icon_close}
            onPress={() => changeSymbol(true)}
            title="清除符号"
          />
        </View>
      </View>
    );
  };

  if (!license || !clientUrl) return null;

  return (
    <WebmapView
      clientUrl={clientUrl}
      onInited={onLoad}
      navigation={props.navigation}>
      {renderTools()}
    </WebmapView>
  );
}

const styles = StyleSheet.create({
  methodBtn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginTop: 20,
  },
  methodBtnImg: {
    height: 30,
    width: 30,
  },
});
