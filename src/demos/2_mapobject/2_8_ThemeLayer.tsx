import {
  Client,
  IGeometryType,
  ILicenseInfo,
  IThemeLabel,
  IThemeLabelRange,
  IThemeLabelUnique,
  IThemeRange,
  IThemeUnique,
  RTNWebMap,
} from '@mapplus/react-native-webmap';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { getAssets } from '../../assets';
import { ImageButton } from '../../components';
import WebmapView from '../../components/WebmapView';
import BaseLayerData from '../../constants/BaseLayerData';
import { DemoStackPageProps } from '../../navigators/types';
import {
  DataUtil,
  LicenseUtil,
  WebMapUtil,
} from '../../utils';
const exampleData = require('../../example/ThemeMap.json');

interface Props extends DemoStackPageProps<'ThemeLayer'> {}

type MThemeLayerType =
  | 'range'
  | 'unique'
  | 'label'
  | 'labelUnique'
  | 'labelRange';

/**
 * 专题图Demo
 */
export default function ThemeLayer(props: Props) {
  const [license, setLicense] = useState<ILicenseInfo | undefined>();
  const [clientUrl, setClientUrl] = useState<string | undefined>();
  const [baseLayer, setBaseLayer] = useState<
    | {
        datasourceID: string;
        geometryType: IGeometryType;
      }
    | undefined
  >();

  const currentThemeLayer = useRef<{
    label: string;
    theme: string;
  }>({
    label: '',
    theme: '',
  });

  useEffect(() => {
    // 激活 sdk 许可
    initLicense();
  }, []);

  useEffect(() => {
    // 激活sdk后，初始化
    if (license) {
      // 获取 sdk web 服务地址
      const res = RTNWebMap.getClientUrl();
      if (res) {
        setClientUrl(res);
      }
    }
    return () => {
      // 退出页面，关闭地图
      WebMapUtil.getClient()?.mapControl.closeMap();
      WebMapUtil.setClient(null);
    };
  }, [license]);

  /** 激活许可 */
  const initLicense = () => {
    LicenseUtil.active().then(res => {
      setLicense(res);
    });
  };

  const init = async (client: Client) => {
    flyToInitPosition();
    await initLayers();
    const sources = await client.datasources.createFromGeoJSON(
      'example',
      exampleData,
    );
    if (sources.length === 1) {
      const source = sources[0];
      if (source.type !== 'geojson') return;
      client.layers.add({
        name: 'layername',
        type: 'vector',
        geometryType: 'fill',
        sourceId: source.id,
        style: {
          fillColor: '#0064ff44',
          fillOutlineColor: '#0064FF',
          fillOutlineWidth: 2,
        },
      });
      setBaseLayer({
        datasourceID: source.id,
        geometryType: source.geometryType,
      });
    }
  };

  /** 初始化默认图层 */
  const initLayers = async () => {
    const webmap = WebMapUtil.getClient();
    if (!webmap) return;

    // 添加默认底图
    const dss = await BaseLayerData.image[0].action();
    for (const ds of dss) {
      ds &&
        (await webmap.baseLayers.add({
          sourceId: ds.id,
          name: ds.name,
          type: 'image',
        }));
    }
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
        x: 2,
        //维度
        y: 48,
      },
      duration: 1000,
      scale: 4.4911532365316153e-8,
    });
  };

  const createThemeLayer = async (type: MThemeLayerType) => {
    const webmap = WebMapUtil.getClient();
    if (!webmap || !baseLayer) return;

    let theme:
      | IThemeRange
      | IThemeLabelRange
      | IThemeUnique
      | IThemeLabelUnique
      | IThemeLabel
      | undefined = undefined;
    let layerName = '';
    // 根据类型创建专题图
    switch (type) {
      case 'range':
        theme = await webmap.theme.createRangeTheme({
          datasourceID: baseLayer.datasourceID,
          geometryType: baseLayer.geometryType,
          expression: '销售额（万元）',
          rangeMode: webmap.RangeMode.EQUALINTERVAL,
          rangeCount: 10,
          colorScheme: webmap.ColorSchemeType.LA_Sky,
        });
        layerName = '分段专题图';
        if (theme && currentThemeLayer.current.theme) {
          // 移除之前的专题图
          await webmap.layers.remove(currentThemeLayer.current.theme);
        }
        break;
      case 'unique':
        theme = await webmap.theme.createUniqueTheme({
          datasourceID: baseLayer.datasourceID,
          expression: '订单数',
        });
        layerName = '单值专题图';
        if (theme && currentThemeLayer.current.theme) {
          // 移除之前的专题图
          await webmap.layers.remove(currentThemeLayer.current.theme);
        }
        break;
      case 'label':
        theme = await webmap.theme.createLabelTheme({
          datasourceID: baseLayer.datasourceID,
          expression: '省名称',
          defaultStyle: { textColor: DataUtil.randomColor() },
        });
        layerName = '统一标签专题图';
        if (theme && currentThemeLayer.current.label) {
          // 移除之前的标签专题图
          await webmap.layers.remove(currentThemeLayer.current.label);
        }
        break;
      case 'labelUnique':
        theme = await webmap.theme.createLabelUniqueTheme({
          datasourceID: baseLayer.datasourceID,
          labelExpression: '省名称',
          uniqueExpression: '订单数',
        });
        layerName = '单值标签专题图';
        if (theme && currentThemeLayer.current.label) {
          // 移除之前的标签专题图
          await webmap.layers.remove(currentThemeLayer.current.label);
        }
        break;
      case 'labelRange':
        theme = await webmap.theme.createLabelRangeTheme({
          datasourceID: baseLayer.datasourceID,
          labelExpression: '省名称',
          rangeExpression: '销售额（万元）',
          rangeMode: webmap.RangeMode.EQUALINTERVAL,
          rangeCount: 6,
          colorScheme: webmap.ColorSchemeType.LA_Sky,
        });
        layerName = '分段标签专题图';
        if (theme && currentThemeLayer.current.label) {
          // 移除之前的标签专题图
          await webmap.layers.remove(currentThemeLayer.current.label);
        }
        break;
      default:
        break;
    }
    if (!theme) return;

    let beforeLayerID = '';
    if (!type.includes('label') && currentThemeLayer.current.label) {
      // 标签专题图，添加到标签图层上
      beforeLayerID = currentThemeLayer.current.label;
    }

    // 添加专题图
    const themeLayerID = await webmap.layers.add(
      {
        type: 'theme',
        name: layerName,
        theme: theme as any,
        geometryType: baseLayer.geometryType,
        sourceId: baseLayer.datasourceID,
      },
      beforeLayerID,
    );
    if (themeLayerID) {
      if (type.includes('label')) {
        // 标签专题图
        currentThemeLayer.current.label = themeLayerID;
      } else {
        // 普通专题图
        currentThemeLayer.current.theme = themeLayerID;
      }
    }
    webmap.mapControl.refresh();
  };

  /** 左侧工具栏 */
  const _renderTools = () => {
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
            image={getAssets().icon_theme}
            title={'单值'}
            onPress={() => createThemeLayer('unique')}
          />
          <ImageButton
            style={styles.methodBtn}
            image={getAssets().icon_theme}
            title={'分段'}
            onPress={() => createThemeLayer('range')}
          />
          <ImageButton
            style={styles.methodBtn}
            image={getAssets().icon_label}
            title={'统一标签'}
            onPress={() => createThemeLayer('label')}
          />
          <ImageButton
            style={styles.methodBtn}
            image={getAssets().icon_label}
            title={'单值标签'}
            onPress={() => createThemeLayer('labelUnique')}
          />
          <ImageButton
            style={styles.methodBtn}
            image={getAssets().icon_label}
            title={'分段标签'}
            onPress={() => createThemeLayer('labelRange')}
          />
        </View>
      </View>
    );
  };

  if (!license || !clientUrl) return null;

  return (
    <WebmapView
      clientUrl={clientUrl}
      onInited={client => {
        WebMapUtil.setClient(client);
        init(client);
      }}
      navigation={props.navigation}>
      {_renderTools()}
    </WebmapView>
  );
}

const styles = StyleSheet.create({
  methodBtn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: 40,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginTop: 20,
  },
});
