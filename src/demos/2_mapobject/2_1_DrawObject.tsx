/**
 * 几何图形绘制Demo
 */
import { AddLayerParam, IFillStyle, ILicenseInfo, ILineStyle, IPointStyle, RTNWebMap } from '@mapplus/react-native-webmap';
import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getAssets } from '../../assets';
import WebmapView from '../../components/WebmapView';
import BaseLayerData from '../../constants/BaseLayerData';
import { DemoStackPageProps } from '../../navigators/types';
import { LicenseUtil, WebMapUtil } from '../../utils';

interface Props extends DemoStackPageProps<'DrawObject'> { }

/** 绘制类型 */
enum DrawType {
  Null,
  /** 点 */
  Point,
  /** 线 */
  Line,
  /** 面 */
  Region,
}

export default function DrawObject(props: Props) {

  const pointLayerID = useRef<string>()
  const lineLayerID = useRef<string>()
  const regionLayerID = useRef<string>()
  const currentLayerID = useRef<string>()

  const [license, setLicense] = useState<ILicenseInfo | undefined>()

  const [drawType, setDrawType] = useState<DrawType>(DrawType.Null);

  /** 准星图标句柄 用于获取屏幕坐标 */
  const aimPointImageRef = useRef<Image>(null)
  const editTimer = useRef<number | null>(null)
  const editPoints = useRef<any[]>([])
  const history = useRef<{ layer: string, id: string }[]>([])

  const [clientUrl, setClientUrl] = useState<string | undefined>()


  /** 激活许可 */
  const initLicense = () => {
    LicenseUtil.active().then(res => {
      setLicense(res)
    })
  }

  useEffect(() => {
    // 激活 sdk 许可
    initLicense()
  }, [])

  useEffect(() => {
    // 激活sdk后，初始化
    if (license) {
      // 获取 sdk web 服务地址
      const res = RTNWebMap?.getClientUrl()
      if (res) {
        setClientUrl(res)
      }
    }
    return () => {
      // 退出页面，关闭地图
      WebMapUtil.getClient()?.mapControl.closeMap()
      WebMapUtil.setClient(null)
    }
  }, [license])

  /**
   * 设置绘制事件
   * @param type 
   * @returns 
   */
  const setAction = async (type: DrawType) => {
    setDrawType(type)

    const client = WebMapUtil.getClient()
    if (!client) return;
    switch (type) {
      case DrawType.Null:
        await client.mapControl.setAction(client.Action.select)
        currentLayerID.current = undefined
        break
      case DrawType.Point:
        if (!pointLayerID.current) return
        currentLayerID.current = pointLayerID.current
        await client.layers.setEditable(currentLayerID.current, true)
        await client.mapControl.setAction(client.Action.draw_point)
        break
      case DrawType.Line: {
        if (!lineLayerID.current) return
        currentLayerID.current = lineLayerID.current
        let result = await client.layers.setEditable(currentLayerID.current, true)
        console.log(result)
        result = await client.mapControl.setAction(client.Action.draw_line)
        console.log(result)
        break
      }
      case DrawType.Region:
        if (!regionLayerID.current) return
        currentLayerID.current = regionLayerID.current
        await client.layers.setEditable(currentLayerID.current, true)
        await client.mapControl.setAction(client.Action.draw_polygon)
        break
    }
  }

  /**
   * 初始化方法
   *
   * 当sdk初始化完成，我们通过这里的初始化方法开始进行场景参数设置及地图初始化工作
   */
  const init = async () => {
    const client = WebMapUtil.getClient()
    if (!client) return;

    flyToInitPosition()

    await addDefaultLayer();
  }

  /**
   * 相机飞行（地图定位）到指定点位
   */
  const flyToInitPosition = async () => {
    const client = WebMapUtil.getClient();
    if (!client) return;
    await client.mapControl.flyTo({
      center: {
        //经度
        x: 103.56990027694332,
        //维度
        y: 38.151379529059,
      },
      duration: 1000,
      scale: 4.4911532365316153e-8,
    });
  }

  /** 添加点图层 */
  const addDefaultPointLayer = async () => {
    const client = WebMapUtil.getClient()

    if (!client) return
    // 添加数据源
    const result = await client.datasources.add({
      type: 'geojson',
      name: 'Point',
      geometryType: 'point',
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
      data: {
        type: "FeatureCollection",
        features: [],
      }
    })
    let layer = undefined
    // 添加图层
    if (result) {
      const style: Partial<IPointStyle> = {
        /** 点大小，单位像素，默认5px */
        circleRadius: 6,
        /** 点颜色 */
        circleColor: '#0064FF',
        /** 纯色轮廓宽度，单位像素，默认0px */
        circleOutlineWidth: 2,
        /** 纯色点轮廓颜色,默认白色 */
        circleOutlineColor: '#FFFFFF',
      }
      const params: AddLayerParam = {
        type: 'vector',
        sourceId: result, // Add sourceId as required by AddLayerParam
        name: 'Point',
        geometryType: 'point',
        style: style,
      }
      layer = await client.layers.add(params)
    }
    return layer
  }

  /** 添加线图层 */
  const addDefaultLineLayer = async () => {
    const client = WebMapUtil.getClient()
    if (!client) return
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
      data: {
        type: "FeatureCollection",
        features: [],
      }
    })
    let layer = undefined
    // 添加图层
    if (result) {
      const style: Partial<ILineStyle> = {
        /** 线颜色 */
        lineColor: '#0064ff',
        /** 线宽。默认 1px */
        lineWidth: 3,
      }
      const params: AddLayerParam = {
        type: 'vector',
        sourceId: result, // Add sourceId as required by AddLayerParam
        name: 'Line',
        geometryType: 'line',
        style: style,
      }
      layer = await client.layers.add(params)
    }
    return layer
  }

  /** 添加面图层 */
  const addDefaultRegionLayer = async () => {
    const client = WebMapUtil.getClient()
    if (!client) return
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
      data: {
        type: "FeatureCollection",
        features: [],
      }
    })
    let layer = undefined
    // 添加图层
    if (result) {
      const style: Partial<IFillStyle> = {
        /** 填充颜色 */
        fillColor: '#0064ff44',
        /** 轮廓颜色 */
        fillOutlineColor: '#0064FF',
        /** 轮廓宽度。默认 1px */
        fillOutlineWidth: 2,
      }
      const params: AddLayerParam = {
        type: 'vector',
        sourceId: result, // Add sourceId as required by AddLayerParam
        name: 'Region',
        geometryType: 'fill',
        style: style,
      }
      layer = await client.layers.add(params)
    }
    return layer
  }

  /**
   * 添加默认图层
   */
  const addDefaultLayer = async () => {
    const client = WebMapUtil.getClient()
    if (!client) return;

    const dss = await BaseLayerData.vector[0].action()
    for (const ds of dss) {
      ds && await client.baseLayers.add({
        sourceId: ds.id,
        name: ds.name,
        type: 'image'
      })
    }

    // 添加默认图层
    pointLayerID.current = await addDefaultPointLayer()
    lineLayerID.current = await addDefaultLineLayer()
    regionLayerID.current = await addDefaultRegionLayer()
  }

  /**
   * 获取屏幕坐标/地图坐标
   * @param transToMapLocation 是否转成地图坐标
   * @returns 
   */
  const getDrawPosition = async (transToMapLocation = true): Promise<any | null> => {
    return new Promise(resolve => {
      const client = WebMapUtil.getClient()
      if (!client) return resolve(null)
      aimPointImageRef.current?.measure(async (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        const pointX = x + width / 2
        const pointY = y + height / 2
        if (transToMapLocation) {
          // 屏幕坐标转为地理坐标
          const tempPoint = await client.mapControl.pxToMap({
            x: pointX,
            y: pointY,
          })
          resolve(tempPoint)
        } else {
          resolve({
            x: pointX,
            y: pointY,
          })
        }
      })
    })
  }

  /**
   * 向 `point` 图层添加一个点
   */
  // const addPoint = async () => {
  //   const client = WebMapUtil.getClient()
  //   if (!client) return;

  //   // 获取点位置
  //   const position = await getDrawPosition()
  //   if (!position || !pointLayerID.current) return

  //   const map = await client.mapControl.getMap()
  //   if (map.crs === 'gcj02') {
  //     const pp = await client.coordTrans.translateGeoJSON({
  //       type: "Feature",
  //       geometry: {
  //         type: "Point",
  //         coordinates: [position.x, position.y]
  //       }
  //     }, 'gcj02', 'wgs84')
  //     if (pp.type === 'Feature' && pp.geometry.type === 'Point') {
  //       position.x = pp.geometry.coordinates[0]
  //       position.y = pp.geometry.coordinates[1]
  //     }
  //   }
  //   const layer = await client.layers.getLayer(pointLayerID.current)
  //   if (!layer || layer.type !== 'vector') return
  //   const datasource = await client.datasources.getSource(layer.sourceId)
  //   if (datasource?.type !== 'geojson') return
  //   const result = await client.datasources.addNew(layer.sourceId, {
  //     type: "Feature",
  //     geometry: {
  //       type: "Point",
  //       coordinates: [position.x, position.y]
  //     }
  //   })
  // }

  /** 提交绘制 */
  const _submit = async () => {
    const client = WebMapUtil.getClient()
    if (!client || drawType === DrawType.Null) return
    client.mapControl.submit()
  }

  /** 取消绘制 */
  const _cancel = async () => {
    const client = WebMapUtil.getClient()
    if (!client || drawType === DrawType.Null) return
    client.mapControl.trash()
  }

  /** 开始绘制 */
  const _draw = async () => {
    const client = WebMapUtil.getClient()
    if (!client || drawType === DrawType.Null) return
    const llPoint = await getDrawPosition(false)
    console.log(llPoint)
    client.mapControl.addTouchPoint(llPoint)
  }

  /** 左侧工具栏 */
  const _renderDrawMethods = () => {
    if (!clientUrl) return null
    return (
      <View
        style={{
          position: 'absolute',
          top: 60,
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
            style={[styles.methodBtn, { backgroundColor: drawType === DrawType.Point ? '#4680DF' : '#fff' }]}
            activeOpacity={0.8}
            onPress={() => setAction(drawType === DrawType.Point ? DrawType.Null : DrawType.Point)}
          >
            <Image source={getAssets().icon_point_black} style={styles.methodBtnImg} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.methodBtn, { backgroundColor: drawType === DrawType.Line ? '#4680DF' : '#fff' }]}
            activeOpacity={0.8}
            onPress={() => setAction(drawType === DrawType.Line ? DrawType.Null : DrawType.Line)}
          >
            <Image source={getAssets().icon_line_black} style={[styles.methodBtnImg, { width: 24, height: 24 }]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.methodBtn, { backgroundColor: drawType === DrawType.Region ? '#4680DF' : '#fff' }]}
            activeOpacity={0.8}
            onPress={() => setAction(drawType === DrawType.Region ? DrawType.Null : DrawType.Region)}
          >
            <Image source={getAssets().icon_region_black} style={styles.methodBtnImg} />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  /** 画图中心点 */
  const _renderAim = () => {
    if (!drawType) return null
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
        pointerEvents={'none'}
      >
        <Image
          ref={aimPointImageRef}
          source={getAssets().icon_aim_point}
          style={{
            width: 36,
            height: 36,
          }}
        />
      </View>
    )
  }

  /** 绘制工具 */
  const _renderBar = () => {
    if (!drawType) return null
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
    )
  }

  const _renderTips = () => {
    if (!drawType) return null
    return (
      <View style={styles.tipsView}>
        <View style={styles.tips}>
          <Text style={styles.tipsTxt}>点击屏幕/点击加号绘制对象</Text>
        </View>
      </View>
    )
  }

  if (!clientUrl) return null

  return (
    <WebmapView
      clientUrl={clientUrl}
      onInited={client => {
        WebMapUtil.setClient(client);
        init()
      }}
      navigation={props.navigation}
    >
      {_renderDrawMethods()}
      {_renderAim()}
      {_renderBar()}
      {_renderTips()}
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
    backgroundColor: '#3499E5'
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