/**
 * 对象编辑Demo
 * 
 * 包含点、线、面、文本对象的点编辑，移动，节点删除，新增节点
 */
import { AddSourceParam, Client, IClickEvent, IGeoJSONData, IGeoJSONFeature, IGeoJSONPoint, IGeometryEvent, ILicenseInfo, RTNWebMap } from '@mapplus/react-native-webmap'
import { useEffect, useRef, useState } from 'react'
import { Image, ImageRequireSource, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { getAssets } from '../../assets'
import { WebmapView } from '../../components'
import BaseLayerData from '../../constants/BaseLayerData'
import { DemoStackPageProps } from '../../navigators/types'
import { LicenseUtil, MapUtil, WebMapUtil } from '../../utils'


interface Props extends DemoStackPageProps<'ObjectEdit'> { }

const TextLayer = 'text'
const PointLayer = 'point'
const LineLayer = 'line'
const RegionLayer = 'region'

interface SelectData { layerId: string, geometryId: number, type?: number }

/**
 * 对象编辑
 * @param props 
 * @returns 
 */
export default function ObjectEdit(props: Props) {
  const [license, setLicense] = useState<ILicenseInfo | undefined>()
  const [clientUrl, setClientUrl] = useState<string | undefined>()

  const [isEdit, setIsEdit] = useState(false);
  const [isMove, setIsMove] = useState(false);

  const [selectData, setSelectData] = useState<SelectData>();

  const textLayerRef = useRef<{
    dsId: string,
    layerId: string,
  } | undefined>(undefined)
  const pointLayerRef = useRef<{
    dsId: string,
    layerId: string,
  } | undefined>(undefined)
  const lineLayerRef = useRef<{
    dsId: string,
    layerId: string,
  } | undefined>(undefined)
  const regionLayerRef = useRef<{
    dsId: string,
    layerId: string,
  } | undefined>(undefined)

  /** 激活许可 */
  const initLicense = () => {
    LicenseUtil.active().then(res => {
      setLicense(res)
    })
  }

  useEffect(() => {
    // 选中对象后，开始编辑
    if (selectData) {
      startEdit()
    }
  }, [selectData])

  const onLoad = (client: Client) => {
    WebMapUtil.setClient(client);
    // 初始化图层
    initLayers()
    // 添加选择监听
    addSelectListener()
  }

  /**
   * 添加图层
   * @param params 
   * @returns 
   */
  const addLayer = async (params: AddSourceParam) => {
    const webmap = WebMapUtil.getClient()
    if (!webmap) return

    let result: {
      dsId: string
      layerId: string
    } | undefined = undefined

    // 添加数据源
    const dsId = await webmap.datasources.add(params)

    if (dsId && params.type === 'geojson') {
      // 添加图层
      const layer = await MapUtil.addLayer({
        dsId,
        geometryType: params.geometryType,
        name: params.name,
      })
      if (layer) {
        result = {
          dsId,
          layerId: layer,
        }
      }
    }

    return result
  }

  /** 添加文本图层 */
  const addDefaultTextLayer = async () => {
    const client = WebMapUtil.getClient()
    if (client) {
      return await addLayer({
        type: "geojson",
        fieldInfos: [],
        geometryType: 'text',
        name: TextLayer,
      })
    }
    return undefined
  }

  /** 添加点图层 */
  const addDefaultPointLayer = async () => {
    const client = WebMapUtil.getClient()
    if (client) {
      return await addLayer({
        type: "geojson",
        fieldInfos: [],
        geometryType: 'point',
        name: PointLayer,
      })
    }
    return undefined
  }

  /** 添加线图层 */
  const addDefaultLineLayer = async () => {
    const client = WebMapUtil.getClient()
    if (client) {
      return await addLayer({
        type: "geojson",
        fieldInfos: [],
        geometryType: 'line',
        name: LineLayer,
      })
    }
    return undefined
  }

  /** 添加面图层 */
  const addDefaultRegionLayer = async () => {
    const client = WebMapUtil.getClient()
    if (client) {
      return await addLayer({
        type: "geojson",
        fieldInfos: [],
        geometryType: 'fill',
        name: RegionLayer,
      })
    }
    return undefined
  }

  /**
   * 地图定位到当前位置
   */
  const flyToInitPosition = async () => {
    const client = WebMapUtil.getClient();
    if (!client) return;

    // 坐标转换为地图坐标系
    const geo = await transGeoByCRS({
      type: "Feature",
      properties:null,
      geometry: {
        type: "Point",
        coordinates: [104.09197291173261, 30.522202566573696],
      }
    }) as IGeoJSONFeature
    if (!geo || !geo.geometry || geo.geometry.type !== 'Point') return;
    await client.mapControl.flyTo({
      center: {
        //经度
        x: geo.geometry.coordinates[0],
        //维度
        y: geo.geometry.coordinates[1],
      },
      duration: 1000,
      scale: 2.4911532365316153e-4,
    });
  }

  /** 初始化默认图层 */
  const initLayers = async () => {
    const client = WebMapUtil.getClient();
    if (!client) return;

    // 添加默认底图
    const dss = await BaseLayerData.image[0].action()
    for (const ds of dss) {
      ds && await client.baseLayers.add({
        sourceId: ds.id,
        name: ds.name,
        type: 'image'
      })
    }

    // 定位到初始位置
    flyToInitPosition()

    // 添加默认图层
    textLayerRef.current = await addDefaultTextLayer()
    pointLayerRef.current = await addDefaultPointLayer()
    lineLayerRef.current = await addDefaultLineLayer()
    regionLayerRef.current = await addDefaultRegionLayer()

    // 添加点、线、面、对象
    addText()
    addPoint()
    addLine()
    addRegion()
  }

  /** 添加选择监听 */
  const addSelectListener = () => {
    const client = WebMapUtil.getClient();
    if (!client) return;
    // 监听对象被选中事件
    client.addListener('onSelect', selectHandler);
  }

  /** 移除选择监听 */
  const removeSelectListener = () => {
    const client = WebMapUtil.getClient();
    if (!client) return;
    // 监听对象被选中事件
    client.removeListener('onSelect', selectHandler);
  }

  useEffect(() => {
    // 激活 sdk 许可
    initLicense()
    return () => {
      removeSelectListener()
      // 退出页面，关闭地图
      WebMapUtil.getClient()?.mapControl.closeMap()
      WebMapUtil.setClient(null)
    }
  }, [])

  useEffect(() => {
    if (license) {
      // 获取 sdk web 服务地址
      const res = RTNWebMap?.getClientUrl()
      if (res) {
        setClientUrl(res)
      }
    }
  }, [license])

  /**
   * 开始编辑
   * @param method 
   * @returns 
   */
  const startEdit = async () => {
    const client = WebMapUtil.getClient();
    if (!client || !selectData) return;

    // 设置选择集操作参数
    client.mapControl.setSelectOption({
      /** 是否支持框选手势，默认false  */
      boxSelectEnable: false,
      /** 累加选择，默认false  ps.按shift时强制进入累加选择模式*/
      accumulative: false,
      /** 累加选择时是否通过框选取消选择状态，默认false  */
      boxUnselectWhenAccumulative: false,
      /** 点击空白处取消选择，默认false  ps.单击鼠标右键强制取消选择 */
      cancleWhenClickNone: true,
      /** 允许拖动选中的可编辑对象，默认false */
      featureDragEnable: false,
      /** 允许删除选中的可编辑对象，默认false */
      featureTrashEnable: true,
    })
    setIsMove(false)
    client.mapControl.setAction(client.Action.edit_vertex)

  }

  const startMove = async () => {
    const client = WebMapUtil.getClient();
    if (!client || !selectData) return;

    // 设置选择集操作参数
    client.mapControl.setSelectOption({
      /** 是否支持框选手势，默认false  */
      boxSelectEnable: false,
      /** 累加选择，默认false  ps.按shift时强制进入累加选择模式*/
      accumulative: false,
      /** 累加选择时是否通过框选取消选择状态，默认false  */
      boxUnselectWhenAccumulative: false,
      /** 点击空白处取消选择，默认false  ps.单击鼠标右键强制取消选择 */
      cancleWhenClickNone: true,
      /** 允许拖动选中的可编辑对象，默认false */
      featureDragEnable: true,
      /** 允许删除选中的可编辑对象，默认false */
      featureTrashEnable: true,
    })
    setIsMove(true)
    client.mapControl.setAction(client.Action.select)
  }

  const selectHandler = async (data: {
    /**
     * 返回选中的对象数组
     */
    geometries: IGeometryEvent[];
    event: IClickEvent;
  }) => {
    const client = WebMapUtil.getClient();
    if (!client || isMove) return;

    if (data.geometries.length > 0) {
      // 编辑对象之前，要设置对象所在图层可编辑
      await client.layers.setEditable(data.geometries[0].layerId, true)
      // 把要编辑的对象设置为编辑状态
      await client.mapControl.appointEditGeometry(data.geometries[0].layerId, data.geometries[0].geometryId)
      setSelectData({
        layerId: data.geometries[0].layerId,
        geometryId: data.geometries[0].geometryId,
      })
    }
  }

  /** 编辑按钮 */
  const editAction = (edit?: boolean) => {
    const client = WebMapUtil.getClient();
    if (!client) return;
    let _edit = !isEdit
    if (edit !== undefined) _edit = edit
    if (!_edit) {
      // 取消编辑状态
      client.mapControl.setAction(client.Action.pan);
      // 取消选中对象
      setSelectData(undefined)
    } else {
      client.mapControl.setAction(client.Action.select);
    }
    setIsEdit(_edit);
  }

  /** 取消 */
  const cancel = async () => {
    const client = WebMapUtil.getClient();
    if (!client) return;
    client.mapControl.setAction(client.Action.select);
    // 取消后，设置为不可拖动 和 不可删除
    client.mapControl.setSelectOption({
      /** 是否支持框选手势，默认false  */
      boxSelectEnable: false,
      /** 累加选择，默认false  ps.按shift时强制进入累加选择模式*/
      accumulative: false,
      /** 累加选择时是否通过框选取消选择状态，默认false  */
      boxUnselectWhenAccumulative: false,
      /** 点击空白处取消选择，默认false  ps.单击鼠标右键强制取消选择 */
      cancleWhenClickNone: true,
      /** 允许拖动选中的可编辑对象，默认false */
      featureDragEnable: false,
      /** 允许删除选中的可编辑对象，默认false */
      featureTrashEnable: false,
    })
    setIsMove(false)
  }

  /**
   * 坐标转换为地图坐标
   * @param geo 
   * @returns 
   */
  const transGeoByCRS = async (geo: IGeoJSONData) => {
    const client = WebMapUtil.getClient()
    if (!client) return geo
    const map = await client.mapControl.getMap()
    let result = geo
    if (map.crs === 'gcj02') {
      result = await client.coordTrans.translateGeoJSON(geo, 'wgs84', 'gcj02')
    }
    return result
  }

  /**
   * 添加点
   */
  const addText = async () => {
    const client = WebMapUtil.getClient();
    if (!client || !textLayerRef.current) return;

    // 检查数据源是否存在
    const ds = await client.datasources.getSource(textLayerRef.current.dsId)
    if (!ds) return;

    // 检测图层是否存在
    const layer = await client.layers.getLayer(textLayerRef.current.layerId)
    if (!layer) return;

    if (ds?.type === 'geojson') {
      // 示例中使用的坐标为'wgs84'中的坐标，需要坐标转换
      // 坐标转化为地图坐标
      const geo = await transGeoByCRS({
        type: "Feature",
        properties:null,
        geometry: {
          type: "Point",
          coordinates: [104.09197291173261, 30.523202566973696],
        }
      }) as IGeoJSONFeature
      // 添加对象
      const result = await client.recordset.addNew(textLayerRef.current.dsId, {
        /** 文本 */
        text: '文本',
        type:'text',
        textStyle:{textSize: 20, textColor: '#4680DF'},
        /** 文本位置 */
        point: [
           (geo.geometry as IGeoJSONPoint).coordinates[0],
           (geo.geometry as IGeoJSONPoint).coordinates[1],
        ],
      })
    }
  }

  /**
   * 添加点
   */
  const addPoint = async () => {
    const client = WebMapUtil.getClient();
    if (!client || !pointLayerRef.current) return;

    // 检查数据源是否存在
    const ds = await client.datasources.getSource(pointLayerRef.current.dsId)
    if (!ds) return;

    // 检测图层是否存在
    const layer = await client.layers.getLayer(pointLayerRef.current.layerId)
    if (!layer) return;

    if (ds?.type === 'geojson') {
      // 示例中使用的坐标为'wgs84'中的坐标，需要坐标转换
      // 坐标转化为地图坐标
      const geo = await transGeoByCRS({
        type: "Feature",
        properties:null,
        geometry: {
          type: "Point",
          coordinates: [104.09197291173261, 30.522202566573696],
        }
      }) as IGeoJSONFeature
      // 添加对象
      const result = await client.recordset.addNew(pointLayerRef.current.dsId, geo.geometry)
    }
  }

  /**
   * 添加线
   */
  const addLine = async () => {
    const client = WebMapUtil.getClient();
    if (!client || !lineLayerRef.current) return;

    // 检查数据源是否存在
    const ds = await client.datasources.getSource(lineLayerRef.current.dsId)
    if (!ds) return;

    // 检测图层是否存在
    const layer = await client.layers.getLayer(lineLayerRef.current.layerId)
    if (!layer) return;

    if (ds?.type === 'geojson') {
      // 示例中使用的坐标为'wgs84'中的坐标，需要坐标转换
      // 坐标转化为地图坐标
      const geo = await transGeoByCRS({
        type: "Feature",
        properties:null,
        geometry: {
          type: "LineString",
          coordinates: [
            [104.08859448400918, 30.520262722685803],
            [104.09134848951884, 30.521003289516923],
            [104.09306035594514, 30.52094314089782],
          ],
        }
      }) as IGeoJSONFeature
      // 添加对象
      const result = await client.recordset.addNew(lineLayerRef.current.dsId, geo.geometry)
    }
  }

  /**
   * 添加面
   */
  const addRegion = async () => {
    const client = WebMapUtil.getClient();
    if (!client || !regionLayerRef.current) return;

    // 检查数据源是否存在
    const ds = await client.datasources.getSource(regionLayerRef.current.dsId)
    if (!ds) return;

    // 检测图层是否存在
    const layer = await client.layers.getLayer(regionLayerRef.current.layerId)
    if (!layer) return;

    if (ds?.type === 'geojson') {
      // 坐标转化为地图坐标
      const geo = await transGeoByCRS({
        type: "Feature",
        properties:null,
        geometry: {
          type: "Polygon",
          
          // 示例中使用的坐标为'wgs84'中的坐标
          coordinates: [
            [
              [104.09041239594507, 30.522565980817113],
              [104.09039102991115, 30.52191151632133],
              [104.09126063326975, 30.521911503777226],
              [104.0912553009503, 30.522581351706652],
              [104.09041239594507, 30.522565980817113],
            ]
          ],
        }
      }) as IGeoJSONFeature
      // 添加对象
      
      const result = await client.recordset.addNew(regionLayerRef.current.dsId, geo.geometry)
    }
  }

  /** 删除节点 */
  const deleteNode = async () => {
    const client = WebMapUtil.getClient();
    if (!client || !selectData) return;
    // 删除节点
    client.mapControl.trash()
  }

  /** 编辑后提交 */
  const submit = async () => {
    const client = WebMapUtil.getClient();
    if (!client || !selectData) return;

    // 修改后提交
    client.mapControl.submit()
    // 修改为不可平移状态
    setIsMove(false)
    // 修改为选择模式
    client.mapControl.setAction(client.Action.select)
  }

  /** 删除对象 */
  const deleteObj = async () => {
    const client = WebMapUtil.getClient();
    if (!client || !selectData) return;

    const layer = await client.layers.getLayer(selectData.layerId)
    // 只有矢量/文本/专题图层可以删除
    if (layer && (layer.type === 'vector' || layer.type === 'text' || layer.type === 'theme')) {
      // 删除对象
      await client.recordset.delete(layer.sourceId, {ids:[selectData.geometryId]})
      // if (result)
         {
        // 清空选择集，移除选中高亮
        await client.layers.clearSelection(selectData.layerId)
        // 刷新图层
        await client.layers.refresh(selectData.layerId)
        // 回到选择模式
        cancel()
      }
    }
  }

  /**
   * 图片按钮
   * @param image 
   * @returns 
   */
  const renderImageBtn = (image: ImageRequireSource, title: string, action: () => void, isSelected?: boolean) => {
    return (
      <TouchableOpacity
        style={[styles.imgBtn, isSelected && { backgroundColor: '#4680DF' }]}
        onPress={() => {
          if (!selectData) return
          action()
        }}
      >
        <Image source={image} style={{ width: 30, height: 30 }} />
        <Text style={{ fontSize: 10, color: '#000' }}>{title}</Text>
      </TouchableOpacity>
    )
  }

  /**
   * 编辑视图
   * @returns 
   */
  const renderToolsView = () => {
    const client = WebMapUtil.getClient();
    if (!selectData || !client) return null

    return (
      <View style={styles.editBar}>
        <View style={styles.rowContent}>
          {renderImageBtn(getAssets().icon_editor, '编辑', startEdit)}
          {renderImageBtn(getAssets().icon_node_delete, '删除节点', deleteNode)}
          {renderImageBtn(getAssets().icon_delete_black, '删除对象', deleteObj)}
          {renderImageBtn(getAssets().icon_node_move, '平移', startMove, isMove)}
        </View>

        <View style={[styles.rowContent, { justifyContent: 'space-between' }]}>
          {renderImageBtn(getAssets().icon_close, '取消', cancel)}
          {renderImageBtn(getAssets().icon_submit_black, '提交', submit)}
        </View>
      </View>
    )
  }

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
        }}
      >
        <View
          style={{
            width: '30%',
            marginLeft: 10,
          }}>
          <TouchableOpacity
            style={[styles.methodBtn, { backgroundColor: isEdit ? '#4680DF' : '#fff' }]}
            activeOpacity={0.8}
            onPress={() => editAction()}
          >
            <Image source={getAssets().icon_editor} style={styles.methodBtnImg} />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const renderTips = () => {
    if (!isEdit || selectData) return null
    return (
      <View style={styles.tipsView}>
        <View style={styles.tips}>
          <Text style={styles.tipsTxt}>请选择对象</Text>
        </View>
      </View>
    )
  }

  if (!license || !clientUrl) return null

  return (
    <WebmapView
      clientUrl={clientUrl}
      onInited={onLoad}
      navigation={props.navigation}
    >
      {renderTips()}
      {renderTools()}
      {renderToolsView()}
    </WebmapView>
  )
}

const styles = StyleSheet.create({
  editBar: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 10,
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
  rowContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
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
    marginTop: 20
  },
  methodBtnImg: {
    height: 30,
    width: 30,
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
  }
});