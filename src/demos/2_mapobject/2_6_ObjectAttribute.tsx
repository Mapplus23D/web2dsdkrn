/**
 * 属性编辑Demo
 */
import {
  AddSourceParam,
  Client,
  IClickEvent,
  IFieldInfo,
  IGeoJSONData,
  IGeoJSONFeature,
  IGeoJSONPoint,
  IGeometryEvent,
  ILicenseInfo,
  RTNWebMap,
  TFieldType,
  TFieldValueType,
} from '@mapplus/react-native-webmap';
import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Image,
  ImageRequireSource,
  KeyboardAvoidingView,
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getAssets } from '../../assets';
import { WebmapView } from '../../components';
import { DemoStackPageProps } from '../../navigators/types';
import { LicenseUtil, MapUtil, WebMapUtil } from '../../utils';

interface Props extends DemoStackPageProps<'ObjectAttribute'> {}

const TextLayer = 'text';
const PointLayer = 'point';
const LineLayer = 'line';
const RegionLayer = 'region';

interface SelectData {
  geometryId: number;
  layerId: string;
  sourceId: string;
}
interface MyFieldInfo {
  name: string;
  value: string | number | boolean | null | undefined;
  type: TFieldType;
}

/**
 * 对象属性编辑
 * @param props
 * @returns
 */
export default function ObjectAttribute(props: Props) {
  const [license, setLicense] = useState<ILicenseInfo | undefined>();
  const [clientUrl, setClientUrl] = useState<string | undefined>();

  const [selectData, setSelectData] = useState<SelectData>();
  const [fieldInfos, setFieldInfos] = useState<MyFieldInfo[]>([]);

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

  /** 激活许可 */
  const initLicense = () => {
    LicenseUtil.active().then(res => {
      setLicense(res);
    });
  };

  const onLoad = (client: Client) => {
    WebMapUtil.setClient(client);
    // 初始化图层
    initLayers();
    initOptions();
  };

  const initOptions = () => {
    const client = WebMapUtil.getClient();
    if (!client) return;
    // 添加选择监听
    addSelectListener();
    // 设置为选择模式
    client.mapControl.setAction(client.Action.select);
  };

  /**
   * 添加图层
   * @param params
   * @returns
   */
  const addLayer = async (params: AddSourceParam) => {
    const client = WebMapUtil.getClient();
    if (!client) return;

    let result:
      | {
          dsId: string;
          layerId: string;
        }
      | undefined = undefined;

    // 添加数据源
    const dsId = await client.datasources.add(params);

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
        fieldInfos: [
          {
            /**字段名*/
            name: '名称',
            /**字段类型*/
            type: 'TEXT',
          },
          {
            /**字段名*/
            name: '数字',
            /**字段类型*/
            type: 'FLOAT',
          },
        ],
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
        fieldInfos: [
          {
            /**字段名*/
            name: '名称',
            /**字段类型*/
            type: 'TEXT',
          },
          {
            /**字段名*/
            name: '数字',
            /**字段类型*/
            type: 'FLOAT',
          },
        ],
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
        fieldInfos: [
          {
            /**字段名*/
            name: '名称',
            /**字段类型*/
            type: 'TEXT',
          },
          {
            /**字段名*/
            name: '数字',
            /**字段类型*/
            type: 'FLOAT',
          },
        ],
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
        fieldInfos: [
          {
            /**字段名*/
            name: '名称',
            /**字段类型*/
            type: 'TEXT',
          },
          {
            /**字段名*/
            name: '数字',
            /**字段类型*/
            type: 'FLOAT',
          },
        ],
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
    await MapUtil.initDefaultLayer();

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

  /** 添加选择监听 */
  const addSelectListener = () => {
    const client = WebMapUtil.getClient();
    if (!client) return;
    // 监听对象被选中事件
    client.addListener('onSelect', selectHandler);
  };

  /** 移除选择监听 */
  const removeSelectListener = () => {
    const client = WebMapUtil.getClient();
    if (!client) return;
    // 监听对象被选中事件
    client.removeListener('onSelect', selectHandler);
  };

  useEffect(() => {
    // 激活 sdk 许可
    initLicense();
    return () => {
      removeSelectListener();
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

  const selectHandler = async (data: {
    /**
     * 返回选中的对象数组
     */
    geometries: IGeometryEvent[];
    event: IClickEvent;
  }) => {
    const client = WebMapUtil.getClient();
    if (!client) return;

    if (data.geometries.length > 0) {
      const _data = {
        layerId: data.geometries[0].layerId,
        geometryId: data.geometries[0].geometryId,
        sourceId: '',
      };
      const layer = await client.layers.getLayer(data.geometries[0].layerId);
      if (
        layer?.type === 'text' ||
        layer?.type === 'vector' ||
        layer?.type === 'theme'
      ) {
        _data.sourceId = layer.sourceId;
      }
      // 记录选中对象
      setSelectData(_data);
      // 获取选中对象的属性
      getAttributes(_data);
    }
  };

  /**
   * 获取选中对象的属性
   * @param selectData
   * @returns
   */
  const getAttributes = async (selectData: SelectData) => {
    const client = WebMapUtil.getClient();
    if (!client || !selectData) return;

    // 获取图层
    const layer = await client.layers.getLayer(selectData.layerId);
    if (
      layer?.type !== 'text' &&
      layer?.type !== 'theme' &&
      layer?.type !== 'vector'
    )
      return;
    // 获取数据源
    const ds = await client.datasources.getSource(layer.sourceId);
    if (!ds || ds.type !== 'geojson') return;

    const _fieldInfos: MyFieldInfo[] = [];

    for (let i = 0; i < ds.fieldInfos.length; i++) {
      const _fieldInfo = ds.fieldInfos[i];
      // 系统字段直接跳过
      if (_fieldInfo.isSystem) continue;
      // 获取属性字段的值
      const _value = await client.recordset.getFieldValue(
        layer.sourceId,
        selectData.geometryId,
        _fieldInfo.name,
      );

      _fieldInfos.push({
        name: _fieldInfo.name,
        value: _value?.value,
        type: _fieldInfo.type,
      });
    }

    setFieldInfos(_fieldInfos);
  };

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

  const onChangeText = (key: string, value: string) => {
    const client = WebMapUtil.getClient();
    if (!client || !selectData) return;
    // 更新选中对象的属性
    client.recordset.setFieldValue(
      selectData.sourceId,
      selectData.geometryId,
      key,
      key === '数字' ? Number(value) : value,
    );
  };

  /**
   * 新增属性字段
   * @returns
   */
  const addAttribute = async () => {
    const client = WebMapUtil.getClient();
    if (!client || !selectData) return;

    const newFieldInfo: IFieldInfo = {
      /**字段名*/
      name: '属性' + fieldInfos.length,
      /**字段类型*/
      type: 'TEXT',
    };
    // 添加属性
    const result = await client.datasources.addFieldInfo(
      selectData.sourceId,
      newFieldInfo,
    );
    if (result) {
      setFieldInfos(infos => {
        const _infos = [...infos];
        _infos.push({
          ...newFieldInfo,
          value: '',
        });
        return _infos;
      });
    }
  };

  /**
   * 删除最后一个属性字段
   * @returns
   */
  const deleteAttribute = async () => {
    const client = WebMapUtil.getClient();
    if (!client || !selectData) return;

    const _fieldInfos = [...fieldInfos];
    if (_fieldInfos.length > 0) {
      const info = _fieldInfos.pop();
      if (!info) return;
      // 删除属性
      const result = await client.datasources.removeFieldInfo(
        selectData.sourceId,
        info.name,
      );
      if (result) {
        setFieldInfos(_fieldInfos);
      }
    }
  };

  /**
   * 关闭属性弹框
   * @returns
   */
  const closeAttribute = async () => {
    const client = WebMapUtil.getClient();
    if (!client || !selectData) return;

    // 清空选择集
    await client.layers.clearSelection(selectData.layerId);
    // 刷新图层
    await client.layers.refresh(selectData.layerId);
    // 清空选中对象
    setSelectData(undefined);
  };

  const renderInputRow = (
    key: string,
    name: string,
    value: string,
    type: TFieldType,
  ) => {
    let keyboardType: KeyboardTypeOptions = 'default';
    switch (type) {
      case 'INT':
      case 'FLOAT':
        keyboardType = 'numeric';
        break;
      case 'BOOLEAN':
      case 'TEXT':
      default:
        keyboardType = 'default';
    }
    return (
      <View style={styles.rowView} key={key + '_' + name}>
        <Text style={styles.rowTitle}>{name}:</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor={'#000000ff'}
          defaultValue={value}
          keyboardType={keyboardType}
          onChangeText={text => {
            onChangeText(name, text);
          }}
        />
      </View>
    );
  };

  /**
   * 图片按钮
   * @param image
   * @returns
   */
  const renderImageBtn = (image: ImageRequireSource, action: () => void) => {
    return (
      <TouchableOpacity style={styles.imgBtn} onPress={action}>
        <Image source={image} style={{ width: 30, height: 30 }} />
      </TouchableOpacity>
    );
  };

  const renderAttributeView = () => {
    if (!selectData) return null;
    const views: ReactNode[] = [];
    for (let i = 0; i < fieldInfos.length; i++) {
      const info = fieldInfos[i];
      let v = info.value === undefined ? '' : info.value + '';
      views.push(
        renderInputRow(
          `${selectData.layerId}_${selectData.geometryId}_${i}`,
          info.name,
          v,
          info.type,
        ),
      );
    }
    return (
      <KeyboardAvoidingView behavior={'position'} keyboardVerticalOffset={36}>
        <View style={styles.attributeView}>
          {views}
          <View style={styles.attributeBottomView}>
            {renderImageBtn(getAssets().icon_close, closeAttribute)}
            {renderImageBtn(getAssets().icon_add, addAttribute)}
            {renderImageBtn(getAssets().icon_delete_black, deleteAttribute)}
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  };

  const renderTips = () => {
    if (selectData) return null;
    return (
      <View style={styles.tipsView}>
        <View style={styles.tips}>
          <Text style={styles.tipsTxt}>请选择对象</Text>
        </View>
      </View>
    );
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
        }}></View>
    );
  };

  if (!license || !clientUrl) return null;

  return (
    <WebmapView
      clientUrl={clientUrl}
      onInited={onLoad}
      navigation={props.navigation}>
      {renderTools()}
      {renderTips()}
      {renderAttributeView()}
    </WebmapView>
  );
}

const styles = StyleSheet.create({
  attributeView: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 10,
  },
  attributeBottomView: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  rowView: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    width: '100%',
  },
  rowTitle: {
    fontSize: 14,
    color: '#000',
    width: 50,
  },
  input: {
    flex: 1,
    backgroundColor: '#efefef',
    height: 40,
    color: '#000',
    borderRadius: 4,
    textAlign: 'center',
  },
  imgBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderRadius: 4,
    height: 40,
    width: '25%',
  },

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
  tipsView: {
    position: 'absolute',
    top: 20,
    left: 0,
    height: 30,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tips: {
    backgroundColor: '#rgba(0,0,0,0.3)',
    padding: 8,
    borderRadius: 5,
    textAlign: 'center',
  },
  tipsTxt: {
    color: '#fff',
    fontSize: 14,
  },
});
