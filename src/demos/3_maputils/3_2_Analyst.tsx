/**
 * 分析Demo
 *
 * 包含线重采样，线光滑，面相交，面合并，面擦除
 */
import {
  AddLayerParam,
  Client,
  IClickEvent,
  IFillStyle,
  IGeoJSONFeature,
  IGeoJSONLine,
  IGeoJSONPolygon,
  IGeometryEvent,
  ILicenseInfo,
  ILineStyle,
  IPoint2D,
  RTNWebMap,
} from '@mapplus/react-native-webmap';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getAssets } from '../../assets';
import { ImageButton, WebmapView } from '../../components';
import BaseLayerData from '../../constants/BaseLayerData';
import { DemoStackPageProps } from '../../navigators/types';
import { DataUtil, LicenseUtil, ToolRefs, WebMapUtil } from '../../utils';
import Toast from 'react-native-easy-toast';

/** 绘制类型 */
enum DrawType {
  Select,
  MultiSelect,
  /** 线 */
  Line,
  /** 面 */
  Region,
}

enum AnalystType {
  Null,
  /** 线重采样 */
  RESAMPLE,
  /** 线光滑*/
  SMOOTH,
  /** 线夹角*/
  LINEANGLE,
  /** 面相交 */
  POLYGON_INTERSECT,
  /** 面合并*/
  POLYGON_UNION,
  /** 面擦除 */
  POLYGON_ERASE,
}

interface SelectData {
  geometryId: number;
  layerId: string;
  sourceId: string;
}

interface Props extends DemoStackPageProps<'Analyst'> {}

/**
 * 分析Demo
 * @param props
 * @returns
 */
export default function Analyst(props: Props) {
  const [license, setLicense] = useState<ILicenseInfo | undefined>();
  const [clientUrl, setClientUrl] = useState<string | undefined>();

  const [drawType, setDrawType] = useState<DrawType>(DrawType.Select);
  const [analystType, setAnalystType] = useState<AnalystType>(AnalystType.Null);
  const lineLayerID = useRef<string>();
  const regionLayerID = useRef<string>();
  const currentLayerID = useRef<string>();

  const selectLine = useRef<SelectData>();
  const selectRegions = useRef<SelectData[]>([]);

  /** 准星图标句柄 用于获取屏幕坐标 */
  const aimPointImageRef = useRef<Image>(null);

  /** 激活许可 */
  const initLicense = () => {
    LicenseUtil.active().then(res => {
      setLicense(res);
    });
  };

  const onLoad = (client: Client) => {
    WebMapUtil.setClient(client);
    initLayers();
    addSelectListener();
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

    lineLayerID.current = await addDefaultLineLayer();
    regionLayerID.current = await addDefaultRegionLayer();

    // 定位到初始位置
    flyToInitPosition();
  };
  useEffect(() => {
    // 激活 sdk 许可
    initLicense();
    return () => {
      // setListener()
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

  const selectHandler = async (data: {
    /**
     * 返回选中的对象数组
     */
    geometries: IGeometryEvent[];
    event: IClickEvent;
  }) => {
    const client = WebMapUtil.getClient();
    if (!client) return;
    console.log(data.geometries);

    selectRegions.current = [];
    for (const geo of data.geometries) {
      const _data: SelectData = {
        layerId: geo.layerId,
        geometryId: geo.geometryId,
        sourceId: '',
      };
      const layer = await client.layers.getLayer(geo.layerId);
      if (
        (layer !== null && layer?.type === 'text') ||
        layer?.type === 'vector' ||
        layer?.type === 'theme'
      ) {
        _data.sourceId = layer.sourceId;

        const ds = await client.datasources.getSource(layer.sourceId);

        if (ds?.type === 'geojson') {
          // 记录选中对象
          if (ds.geometryType === 'line') {
            selectLine.current = _data;
            console.log(selectLine.current);
          } else if (ds.geometryType === 'fill') {
            selectRegions.current.push(_data);
            console.log(selectRegions.current);
          }
        }
      }
    }
  };

  const multiSelectHandler = async (data: { geometries: IGeometryEvent[] }) => {
    const client = WebMapUtil.getClient();
    if (!client) return;
    const geometries: SelectData[] = [];
    for (const geometry of data.geometries) {
      const layer = await client.layers.getLayer(geometry.layerId);
      if (
        layer?.type === 'vector' ||
        layer?.type === 'text' ||
        layer?.type === 'theme'
      ) {
        const ds = await client.datasources.getSource(layer.sourceId);
        if (ds?.type === 'geojson') {
          geometries.push({
            layerId: geometry.layerId,
            geometryId: geometry.geometryId,
            sourceId: layer.sourceId,
          });
        }
      }
    }
    selectRegions.current = geometries;
  };

  /**
   * 设置绘制事件
   * @param type
   * @returns
   */
  const setAction = async (type: DrawType) => {
    setDrawType(type);

    const client = WebMapUtil.getClient();
    if (!client) return;
    switch (type) {
      case DrawType.MultiSelect:
        // 多选
        await client.mapControl.setAction(client.Action.multi_select);
        currentLayerID.current = undefined;
        break;
      case DrawType.Select:
        // 单选
        await client.mapControl.setAction(client.Action.select);
        currentLayerID.current = undefined;
        break;
      case DrawType.Line:
        if (!lineLayerID.current) return;
        currentLayerID.current = lineLayerID.current;
        console.log(currentLayerID.current, true);
        await client.layers.setEditable(currentLayerID.current, true);
        await client.mapControl.setAction(client.Action.draw_line);
        break;
      case DrawType.Region:
        if (!regionLayerID.current) return;
        currentLayerID.current = regionLayerID.current;
        console.log(currentLayerID.current, true);
        await client.layers.setEditable(currentLayerID.current, true);
        await client.mapControl.setAction(client.Action.draw_polygon);
        break;
    }
  };

  /** 添加线图层 */
  const addDefaultLineLayer = async () => {
    const client = WebMapUtil.getClient();
    if (!client) return;
    // 添加数据源
    const result = await client.datasources.add({
      type: 'geojson',
      name: 'Line',
      geometryType: 'line',
      fieldInfos: [
        {
          /** 字段名 */
          name: '名称',
          /** 字段类型 */
          type: 'TEXT',
          /** 别名 */
          caption: '名称',
        },
      ],
    });
    let layer = undefined;
    // 添加图层
    if (result) {
      const style: Partial<ILineStyle> = {
        /** 线颜色 */
        lineColor: '#0064ff',
        /** 线宽。默认 1px */
        lineWidth: 3,
      };
      const params: AddLayerParam = {
        type: 'vector',
        sourceId: result, // Add sourceId as required by AddLayerParam
        name: 'Line',
        geometryType: 'line',
        style: style,
      };
      layer = await client.layers.add(params);
    }
    return layer;
  };

  /** 添加面图层 */
  const addDefaultRegionLayer = async () => {
    const client = WebMapUtil.getClient();
    if (!client) return;
    // 添加数据源
    const result = await client.datasources.add({
      type: 'geojson',
      name: 'Region',
      geometryType: 'fill',
      fieldInfos: [
        {
          /** 字段名 */
          name: '名称',
          /** 字段类型 */
          type: 'TEXT',
          /** 别名 */
          caption: '名称',
        },
      ],
    });
    let layer = undefined;
    // 添加图层
    if (result) {
      const style: Partial<IFillStyle> = {
        /** 填充颜色 */
        fillColor: '#0064ff44',
        /** 轮廓颜色 */
        fillOutlineColor: '#0064FF',
        /** 轮廓宽度。默认 1px */
        fillOutlineWidth: 2,
      };
      const params: AddLayerParam = {
        type: 'vector',
        sourceId: result, // Add sourceId as required by AddLayerParam
        name: 'Region',
        geometryType: 'fill',
        style: style,
      };
      layer = await client.layers.add(params);
    }
    return layer;
  };

  /**
   * 获取屏幕坐标/地图坐标
   * @param transToMapLocation 是否转成地图坐标
   * @returns
   */
  const getDrawPosition = async (
    transToMapLocation = true,
  ): Promise<IPoint2D | null> => {
    return new Promise(resolve => {
      const client = WebMapUtil.getClient();
      if (!client) return resolve(null);
      aimPointImageRef.current?.measure(
        async (
          x: number,
          y: number,
          width: number,
          height: number,
          pageX: number,
          pageY: number,
        ) => {
          let pointX = x + width / 2;
          let pointY = y + height / 2;
          if (Platform.OS === 'android') {
            pointX = pageX + width / 2;
            pointY = pageY + height / 2;
          }
          if (transToMapLocation) {
            // 屏幕坐标转为地理坐标
            const tempPoint = await client.mapControl.pxToMap({
              x: pointX,
              y: pointY,
            });
            resolve(tempPoint);
          } else {
            resolve({
              x: pointX,
              y: pointY,
            });
          }
        },
      );
    });
  };

  /** 提交绘制 */
  const _submit = async () => {
    const client = WebMapUtil.getClient();
    if (!client || drawType === DrawType.Select) return;
    client.mapControl.submit();
  };

  /** 取消绘制 */
  const _cancel = async () => {
    const client = WebMapUtil.getClient();
    if (!client || drawType === DrawType.Select) return;
    client.mapControl.deleteCurrentGeometry();
  };

  /** 开始绘制 */
  const _draw = async () => {
    const client = WebMapUtil.getClient();
    if (!client || drawType === DrawType.Select) return;
    const llPoint = await getDrawPosition(false);
    llPoint && client.mapControl.addTouchPoint(llPoint);
  };

  const _selectLine = async (type: AnalystType) => {
    console.log(analystType);
    if (analystType === AnalystType.LINEANGLE) {
      await setAction(DrawType.MultiSelect);
    } else {
      await setAction(DrawType.Select);
    }
    setAnalystType(type);
  };

  const _selectRegions = async (type: AnalystType) => {
    await setAction(DrawType.MultiSelect);
    setAnalystType(type);
  };

  /** 线重采样 */
  const _resample = async () => {
    const client = WebMapUtil.getClient();
    if (!client || analystType !== AnalystType.RESAMPLE) return;

    if (!selectLine.current) {
      ToolRefs.getToast()?.show('请选择线对象');
      return;
    }

    // 获取被修改对象
    const geo = await client.recordset.toGeoJSON(
      selectLine.current.sourceId,
      false,
      { ids: [selectLine.current.geometryId] },
    );
    if (!geo || geo.type !== 'Feature') {
      ToolRefs.getToast()?.show('请选择线对象');
      return;
    }
    // 线重采样
    const newGeo = await client.geometrist.resample(
      (geo as IGeoJSONFeature).geometry as IGeoJSONLine,
      1,
    );
    if (!newGeo) return;
    // 给新生成的对象赋予被修改对象id
    newGeo.id = selectLine.current.geometryId;
    // 更新被修改的对象
    const result = await client.recordset.setGeometry(
      selectLine.current.sourceId,
      selectLine.current.geometryId,
      newGeo.geometry,
    );
    if (result) {
      // 清除选择集
      await client.layers.clearSelection(selectLine.current.layerId);
      // 刷新图层
      await client.layers.refresh(selectLine.current.layerId);
      // 清空临时线
      selectLine.current = undefined;
    }
  };

  /** 线平滑 */
  const _smooth = async () => {
    const client = WebMapUtil.getClient();
    if (!client || analystType !== AnalystType.SMOOTH) return;

    if (!selectLine.current) {
      ToolRefs.getToast()?.show('请选择线对象');
      return;
    }

    // 获取被修改对象
    const geo = await client.recordset.toGeoJSON(
      selectLine.current.sourceId,
      false,
      { ids: [selectLine.current.geometryId] },
    );
    if (!geo || geo.type !== 'Feature') {
      ToolRefs.getToast()?.show('请选择线对象');
      return;
    }

    // 线平滑
    const newGeo = await client.geometrist.smooth(
      (geo as IGeoJSONFeature).geometry as IGeoJSONLine,
      2,
    );

    if (!newGeo) return;
    // 给新生成的对象赋予被修改对象id
    newGeo.id = selectLine.current.geometryId;
    // 更新被修改的对象
    const result = await client.recordset.setGeometry(
      selectLine.current.sourceId,
      selectLine.current.geometryId,
      newGeo.geometry,
    );
    if (result) {
      // 清除选择集
      await client.layers.clearSelection(selectLine.current.layerId);
      // 刷新图层
      await client.layers.refresh(selectLine.current.layerId);
      // 清空临时线
      selectLine.current = undefined;
    }
  };

  const _lineAnge = async () => {
    const client = WebMapUtil.getClient();
    if (!client || analystType !== AnalystType.LINEANGLE) return;
    // 线夹角

    const line1 = [
      [0, 0],
      [5, 0],
    ];
    const line2 = [
      [0, 0],
      [5, 6],
    ];
    const angle = await client.geometrist.measureLineAngle(
      { type: 'LineString', coordinates: line1 },
      { type: 'LineString', coordinates: line2 },
    );
    Alert.alert(angle + '');
    console.log('夹角', angle);
  };

  /** 面相交 */
  const _polygonIntersect = async () => {
    const client = WebMapUtil.getClient();
    if (
      !client ||
      analystType !== AnalystType.POLYGON_INTERSECT ||
      !selectRegions.current
    )
      return;

    if (selectRegions.current.length !== 2) {
      ToolRefs.getToast()?.show('请选择2个面对象');
      return;
    }

    // 原面1
    // 获取被修改对象
    const geo = await client.recordset.toGeoJSON(
      selectRegions.current[0].sourceId,
      false,
      { ids: [selectRegions.current[0].geometryId] },
    );
    if (!geo || geo.type !== 'Feature') {
      ToolRefs.getToast()?.show('请选择线对象');
      return;
    }

    // 原面2
    // 获取被修改对象
    const geo2 = await client.recordset.toGeoJSON(
      selectRegions.current[1].sourceId,
      false,
      { ids: [selectRegions.current[1].geometryId] },
    );
    if (!geo2 || geo2.type !== 'Feature') {
      ToolRefs.getToast()?.show('请选择线对象');
      return;
    }

    // 面相交
    const newGeo = await client.geometrist.polygonIntersect(
      (geo as IGeoJSONFeature).geometry as IGeoJSONPolygon,
      (geo2 as IGeoJSONFeature).geometry as IGeoJSONPolygon,
    );

    if (!newGeo) return;
    // 给新生成的对象赋予被修改对象id
    newGeo.id = selectRegions.current[0].geometryId;
    // 更新被修改的对象
    const result = await client.recordset.setGeometry(
      selectRegions.current[0].sourceId,
      selectRegions.current[0].geometryId,
      newGeo.geometry,
    );
    if (result) {
      // 删除除修改的面其他的面
      await client.recordset.delete(selectRegions.current[1].sourceId, {
        ids: [selectRegions.current[1].geometryId],
      });
      // 清除选择集
      await client.layers.clearSelection(selectRegions.current[0].layerId);
      // 刷新图层
      await client.layers.refresh(selectRegions.current[0].layerId);
      // 清空临时面选择数组
      selectRegions.current = [];
    }
  };

  /** 面合并 */
  const _polygonUnion = async () => {
    const client = WebMapUtil.getClient();
    if (
      !client ||
      analystType !== AnalystType.POLYGON_UNION ||
      !selectRegions.current
    )
      return;

    if (selectRegions.current.length !== 2) {
      ToolRefs.getToast()?.show('请选择2个面对象');
      return;
    }
    // 原面1
    // 获取被修改对象
    const geo = await client.recordset.toGeoJSON(
      selectRegions.current[0].sourceId,
      false,
      { ids: [selectRegions.current[0].geometryId] },
    );
    if (!geo || geo.type !== 'Feature') {
      ToolRefs.getToast()?.show('请选择线对象');
      return;
    }

    // 原面2
    // 获取被修改对象
    const geo2 = await client.recordset.toGeoJSON(
      selectRegions.current[1].sourceId,
      false,
      { ids: [selectRegions.current[1].geometryId] },
    );
    if (!geo2 || geo2.type !== 'Feature') {
      ToolRefs.getToast()?.show('请选择线对象');
      return;
    }

    /** 面合并 */
    const newGeo = await client.geometrist.polygonUnion(
      (geo as IGeoJSONFeature).geometry as IGeoJSONPolygon,
      (geo2 as IGeoJSONFeature).geometry as IGeoJSONPolygon,
    );

    if (!newGeo) return;
    // 给新生成的对象赋予被修改对象id
    newGeo.id = selectRegions.current[0].geometryId;
    // 更新被修改的对象
    const result = await client.recordset.setGeometry(
      selectRegions.current[0].sourceId,
      selectRegions.current[0].geometryId,
      newGeo.geometry,
    );
    if (result) {
      // 删除除修改的面其他的面
      await client.recordset.delete(selectRegions.current[1].sourceId, {
        ids: [selectRegions.current[1].geometryId],
      });
      // 清除选择集
      await client.layers.clearSelection(selectRegions.current[0].layerId);
      // 刷新图层
      await client.layers.refresh(selectRegions.current[0].layerId);
      // 清空临时面选择数组
      selectRegions.current = [];
    }
  };

  /** 面擦除 */
  const _polygonErase = async () => {
    const client = WebMapUtil.getClient();
    if (
      !client ||
      analystType !== AnalystType.POLYGON_ERASE ||
      !selectRegions.current
    )
      return;
    if (selectRegions.current.length !== 2) {
      ToolRefs.getToast()?.show('请选择2个面对象');
      return;
    }
    // 原面1
    // 获取被修改对象
    const geo = await client.recordset.toGeoJSON(
      selectRegions.current[0].sourceId,
      false,
      { ids: [selectRegions.current[0].geometryId] },
    );
    if (!geo || geo.type !== 'Feature') {
      ToolRefs.getToast()?.show('请选择线对象');
      return;
    }

    // 原面2
    // 获取被修改对象
    const geo2 = await client.recordset.toGeoJSON(
      selectRegions.current[1].sourceId,
      false,
      { ids: [selectRegions.current[1].geometryId] },
    );
    if (!geo2 || geo2.type !== 'Feature') {
      ToolRefs.getToast()?.show('请选择线对象');
      return;
    }

    // 面相交
    const newGeo1 = await client.geometrist.polygonIntersect(
      (geo as IGeoJSONFeature).geometry as IGeoJSONPolygon,
      (geo2 as IGeoJSONFeature).geometry as IGeoJSONPolygon,
    );
    if (!newGeo1) {
      ToolRefs.getToast()?.show('不相交');
      // console.log('不相交')
      return;
    }
    const newGeo = await client.geometrist.polygonErase(
      (geo2 as IGeoJSONFeature).geometry as IGeoJSONPolygon,
      (geo as IGeoJSONFeature).geometry as IGeoJSONPolygon,
    );

    if (!newGeo) return;
    // 给新生成的对象赋予被修改对象id
    newGeo.id = selectRegions.current[0].geometryId;
    // 更新被修改的对象
    const result = await client.recordset.setGeometry(
      selectRegions.current[0].sourceId,
      selectRegions.current[0].geometryId,
      newGeo.geometry,
    );
    if (result) {
      // 删除除修改的面其他的面
      await client.recordset.delete(selectRegions.current[1].sourceId, {
        ids: [selectRegions.current[1].geometryId],
      });
      // 清除选择集
      await client.layers.clearSelection(selectRegions.current[0].layerId);
      // 刷新图层
      await client.layers.refresh(selectRegions.current[0].layerId);
      // 清空临时面选择数组
      selectRegions.current = [];
    }
  };

  const _analyst = async () => {
    switch (analystType) {
      case AnalystType.Null:
        break;
      case AnalystType.RESAMPLE:
        _resample();
        break;
      case AnalystType.SMOOTH:
        _smooth();
        break;
      case AnalystType.LINEANGLE:
        _lineAnge();
        break;
      case AnalystType.POLYGON_INTERSECT:
        _polygonIntersect();
        break;
      case AnalystType.POLYGON_UNION:
        _polygonUnion();
        break;
      case AnalystType.POLYGON_ERASE:
        _polygonErase();
        break;
    }
  };

  /** 画图中心点 */
  const _renderAim = () => {
    // if (!drawType) return null
    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'transparent',
        }}
        pointerEvents={'none'}>
        <Image
          ref={aimPointImageRef}
          source={getAssets().icon_aim_point}
          style={{
            width: 36,
            height: 36,
          }}
        />
      </View>
    );
  };

  /** 左侧工具栏 */
  const _renderDrawMethods = () => {
    if (!clientUrl) return null;
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
            style={[
              styles.methodBtn,
              {
                backgroundColor:
                  drawType === DrawType.Line ? '#4680DF' : '#fff',
              },
            ]}
            image={getAssets().icon_line_black}
            onPress={() => {
              setAnalystType(AnalystType.Null);
              setAction(
                drawType === DrawType.Line ? DrawType.Select : DrawType.Line,
              );
            }}
          />
          <ImageButton
            style={[
              styles.methodBtn,
              {
                backgroundColor:
                  drawType === DrawType.Region ? '#4680DF' : '#fff',
              },
            ]}
            image={getAssets().icon_region_black}
            onPress={() => {
              setAnalystType(AnalystType.Null);
              setAction(
                drawType === DrawType.Region
                  ? DrawType.Select
                  : DrawType.Region,
              );
            }}
          />
          <ImageButton
            style={[
              styles.methodBtn,
              {
                backgroundColor:
                  analystType === AnalystType.RESAMPLE ? '#4680DF' : '#fff',
              },
            ]}
            title="线重采样"
            onPress={() => _selectLine(AnalystType.RESAMPLE)}
          />
          <ImageButton
            style={[
              styles.methodBtn,
              {
                backgroundColor:
                  analystType === AnalystType.SMOOTH ? '#4680DF' : '#fff',
              },
            ]}
            title="线光滑"
            onPress={() => _selectLine(AnalystType.SMOOTH)}
          />
          {/* <ImageButton
            style={[styles.methodBtn, { backgroundColor: analystType === AnalystType.LINEANGLE ? '#4680DF' : '#fff' }]}
            title='线夹角计算'
            onPress={() => _selectLine(AnalystType.LINEANGLE)}
          /> */}
          <ImageButton
            style={[
              styles.methodBtn,
              {
                backgroundColor:
                  analystType === AnalystType.POLYGON_INTERSECT
                    ? '#4680DF'
                    : '#fff',
              },
            ]}
            title="面相交"
            onPress={() => _selectRegions(AnalystType.POLYGON_INTERSECT)}
          />
          <ImageButton
            style={[
              styles.methodBtn,
              {
                backgroundColor:
                  analystType === AnalystType.POLYGON_UNION
                    ? '#4680DF'
                    : '#fff',
              },
            ]}
            title="面合并"
            onPress={() => _selectRegions(AnalystType.POLYGON_UNION)}
          />
          <ImageButton
            style={[
              styles.methodBtn,
              {
                backgroundColor:
                  analystType === AnalystType.POLYGON_ERASE
                    ? '#4680DF'
                    : '#fff',
              },
            ]}
            title="面擦除"
            onPress={() => _selectRegions(AnalystType.POLYGON_ERASE)}
          />
        </View>
      </View>
    );
  };

  /** 绘制工具 */
  const _renderBar = () => {
    if (drawType === DrawType.Select || drawType === DrawType.MultiSelect)
      return null;
    return (
      <View style={styles.textBar}>
        <TouchableOpacity onPress={_cancel} style={styles.bottomBtn}>
          <Text style={styles.bottomBtnText}>取消</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_draw} style={styles.bottomBtn}>
          <Text style={[styles.bottomBtnText, { fontSize: 30 }]}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => _submit()} style={styles.bottomBtn}>
          <Text style={styles.bottomBtnText}>提交</Text>
        </TouchableOpacity>
      </View>
    );
  };

  /**
   * 侧边工具栏
   * @returns
   */
  const _renderTools = () => {
    if (analystType === AnalystType.Null) return null;
    return (
      <View
        style={{
          position: 'absolute',
          top: 80,
          right: 10,
          width: 40,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
        <ImageButton
          style={styles.methodBtn}
          title={'分析'}
          onPress={_analyst}
        />
      </View>
    );
  };

  if (!license || !clientUrl) return null;

  return (
    <WebmapView
      clientUrl={clientUrl}
      onInited={onLoad}
      navigation={props.navigation}>
      {_renderDrawMethods()}
      {_renderTools()}
      {_renderAim()}
      {_renderBar()}
    </WebmapView>
  );
}

const styles = StyleSheet.create({
  textBar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    height: 60,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 10,
  },
  bottomBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderRadius: 4,
    height: 40,
    width: 40,
    backgroundColor: '#3499E5',
  },
  bottomBtnText: {
    color: '#fff',
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
});
