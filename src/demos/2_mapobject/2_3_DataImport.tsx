import { Client, ExcelData, IFieldInfo, ILicenseInfo, RTNWebMap } from '@mapplus/react-native-webmap'
import { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { getAssets } from '../../assets'
import WebmapView from '../../components/WebmapView'
import BaseLayerData from '../../constants/BaseLayerData'
import { DemoStackPageProps } from '../../navigators/types'
import NativeHTools from '../../specs/v1/NativeHTools'
import { LicenseUtil, MapUtil, WebMapUtil } from '../../utils'

interface Props extends DemoStackPageProps<'DataImport'> { }

/**
 * 导入数据Demo
 * 1. 导入 Geojson 数据
 * 2. 导入 Excel 数据
 *    - 选择经纬度字段
 *    - 导入数据到地图
 * @param props 
 * @returns 
 */
export default function DataImport(props: Props) {
  const [license, setLicense] = useState<ILicenseInfo | undefined>()
  const [clientUrl, setClientUrl] = useState<string | undefined>()

  // excel 数据
  const [excelData, setExcelData] = useState<ExcelData>()
  const [xName, setXName] = useState('')
  const [yName, setYName] = useState('')
  const [fieldInfos, setFieldInfos] = useState<IFieldInfo[]>([])
  const [fileName, setFileName] = useState('')

  /** 激活许可 */
  const initLicense = () => {
    LicenseUtil.active().then(res => {
      setLicense(res)
    })
  }

  /** 初始化默认图层 */
  const initLayers = async () => {
    const webmap = WebMapUtil.getClient()
    if (!webmap) return

    // 添加默认底图
    const dss = await BaseLayerData.image[0].action()
    for (const ds of dss) {
      ds && await webmap.baseLayers.add({
        sourceId: ds.id,
        name: ds.name,
        type: 'image'
      })
    }
  }

  useEffect(() => {
    // 1. 激活 sdk 许可
    initLicense()
    return () => {
      // 退出页面，关闭地图
      WebMapUtil.getClient()?.mapControl.closeMap()
      WebMapUtil.setClient(null)
    }
  }, [])

  useEffect(() => {
    if (license) {
      // 2. 获取 sdk web 服务地址
      const res = RTNWebMap?.getClientUrl()
      if (res) {
        setClientUrl(res)
      }
    }
  }, [license])

  const _onLoad = (client: Client) => {
    // 3. 场景加载后，初始化图层
    WebMapUtil.setClient(client);
    initLayers()
  }

  /**
   * 打开文件管理器，选择文件
   */
  const openDictGeoJson = async () => {
    NativeHTools?.openDoc({
      fileSuffixFilters: ['文档|geojson'],
      // 默认文件路径
      defaultFilePathUri: 'file://docs/storage/Users/currentUser/test',
    }).then(async (files) => {
      const client = WebMapUtil.getClient()
      if (!client || files.length <= 0) return

      for (const file of files) {
        const dsName = file.substring(file.lastIndexOf('/') + 1, file.lastIndexOf('.'))
        await MapUtil.importGeojson(file, dsName)
      }
    })
  }
  /**
   * 打开文件管理器，选择 Excel 文件
   */
  const openDictExcel = async () => {
    NativeHTools?.openDoc({
      fileSuffixFilters: ['文档|geojson,xlsx,xls,csv'],
      // 默认文件路径
      defaultFilePathUri: 'file://docs/storage/Users/currentUser/test',
      maxSelectNumber: 1, // 最大选择数量
    }).then(async (files) => {
      const client = WebMapUtil.getClient()
      if (!client || files.length <= 0) return
      console.log(files)
      const result = await MapUtil.readExcel(files[0])
      console.log('读取到的字段信息：', result?.fieldInfos)
      setExcelData(result)
      if (result?.fieldInfos) {
        const dsName = files[0].substring(files[0].lastIndexOf('/') + 1, files[0].lastIndexOf('.'))
        setFileName(dsName)
        setFieldInfos(result.fieldInfos)
      }
    })
  }

  /** 左侧工具栏 */
  const _renderTools = () => {
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
            style={styles.methodBtn}
            activeOpacity={0.8}
            onPress={() => openDictGeoJson()}
          >
            <Image source={getAssets().icon_import} style={styles.methodBtnImg} />
            <Text style={styles.methodBtnTxt}>Geojson</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.methodBtn}
            activeOpacity={0.8}
            onPress={() => openDictExcel()}
          >
            <Image source={getAssets().icon_import} style={styles.methodBtnImg} />
            <Text style={styles.methodBtnTxt}>Excel</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const _renderListItem = (section: number, item: IFieldInfo) => {
    return (
      <TouchableOpacity
        key={`${section}-${item.name}`}
        style={{
          padding: 10,
          borderBottomWidth: 1,
          borderBottomColor: '#ccc',
          backgroundColor: (section === 1 && item.name === xName) || (section === 2 && item.name === yName) ? '#e0f7fa' : '#fff',
        }}
        onPress={() => {
          if (section === 1) {
            setXName(item.name)
          } else if (section === 2) {
            setYName(item.name)
          }
        }}
      >
        <Text>{item.name}</Text>
      </TouchableOpacity>
    )
  }

  const cancel = () => {
    setExcelData(undefined)
    setFieldInfos([])
    setXName('')
    setYName('')
    setFileName('')
  }

  const submit = () => {
    if (!excelData || !xName || !yName) {
      console.error('请先选择经纬度字段')
      return
    }
    MapUtil.importExcel({
      data: excelData,
      xName: xName,
      yName: yName,
      dsName: 'qwe',
    }).then((result) => {
      if (result) {
        // 导入成功后，清空选择
        cancel()
        // 刷新地图
        WebMapUtil.getClient()?.mapControl.refresh()
      } else {
        console.error('导入失败')
      }
    })
  }

  const _renderXYModel = () => {
    if (fieldInfos.length <= 0) return
    return (
      <View style={styles.modelContainer}>
        <View style={styles.modelHeader}>
          <Text style={styles.modelHeaderText}>请选择经纬度字段名称</Text>
        </View>

        <View style={styles.modelListHeader}>
          <Text style={styles.modelListHeaderText}>经度</Text>
          <Text style={styles.modelListHeaderText}>纬度</Text>
        </View>
        <View style={styles.modelContent}>
          <ScrollView
            style={styles.modelList}
          >
            {
              fieldInfos.map((item, index) => _renderListItem(1, item))
            }
          </ScrollView>
          <ScrollView
            style={styles.modelList}
          >
            {
              fieldInfos.map((item, index) => _renderListItem(2, item))
            }
          </ScrollView>
        </View>
        <View style={styles.modelBottom}>
          <TouchableOpacity
            style={styles.modelBtn}
            onPress={cancel}
          >
            <Text style={{ color: '#fff', textAlign: 'center' }}>取消</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modelBtn}
            onPress={submit}
          >
            <Text style={{ color: '#fff', textAlign: 'center' }}>导入</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (!license || !clientUrl) return null

  return (
    <>
      <WebmapView
        clientUrl={clientUrl}
        onInited={_onLoad}
        navigation={props.navigation}
      >
        {_renderTools()}
        {_renderXYModel()}
      </WebmapView>
    </>
  )
}

const styles = StyleSheet.create({
  methodBtn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 60,
    width: 40,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginTop: 20
  },
  methodBtnImg: {
    height: 24,
    width: 24,
  },
  methodBtnTxt: {
    fontSize: 10,
    marginTop: 4,
  },
  modelContainer: {
    position: 'absolute',
    width: '100%',
    height: 300,
    backgroundColor: '#fff',
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100001,
  },
  modelHeader: {
    width: '100%',
    padding: 10,
  },
  modelHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  modelListHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingBottom: 10,
  },
  modelListHeaderText: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  modelContent: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
  },
  modelList: {
    flex: 1,
    margin: 10,
  },
  modelBottom: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: 10,
  },
  modelBtn: {
    backgroundColor: '#0064FF',
    padding: 10,
    borderRadius: 4,
    marginTop: 10,
  },
});