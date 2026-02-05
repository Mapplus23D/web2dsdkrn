import { Client, ExcelData, IFieldInfo, ILicenseInfo, RTNWebMap } from '@mapplus/react-native-webmap'
import RNFS from '@react-native-ohos/react-native-fs'
import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { getAssets } from '../../assets'
import { ImageButton } from '../../components'
import WebmapView from '../../components/WebmapView'
import BaseLayerData from '../../constants/BaseLayerData'
import { DemoStackPageProps } from '../../navigators/types'
import NativeHTools from '../../specs/v1/NativeHTools'
import { LicenseUtil, MapUtil, ToolRefs, WebMapUtil } from '../../utils'

interface Props extends DemoStackPageProps<'DataImport'> { }

/**
 * 导入数据Demo
 * 1. 导入 Geojson 数据
 * 2. 导入 Excel 数据
 *    - 选择经纬度字段
 *    - 导入数据到地图
 * 3. 导入 shp 数据
 * 4. 导入 shp 的zip文件数据
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
      ToolRefs.getLoading()?.setLoading(true, {
        info: '正在导入数据...',
      })

      try {
        for (const file of files) {
          const dsName = file.substring(file.lastIndexOf('/') + 1, file.lastIndexOf('.'))
           const _path = decodeURI( file.split('file://docs')[1] )
           console.log('_path', _path)
          const content = await RNFS.readFile( _path)
          // const content = await NativeHTools?.readFile(file)
          const geojson = content ? JSON.parse(content) : undefined
          geojson && await MapUtil.importGeojson(geojson, dsName)
        }
        ToolRefs.getLoading()?.setLoading(false)
      } catch (error) {
        ToolRefs.getLoading()?.setLoading(false)
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
      ToolRefs.getLoading()?.setLoading(true, {
        info: '正在导入数据...',
      })
      try {
        const result = await MapUtil.readExcel(files[0])
        setExcelData(result)
        if (result?.fieldInfos) {
          const dsName = files[0].substring(files[0].lastIndexOf('/') + 1, files[0].lastIndexOf('.'))
          setFileName(dsName)
          setFieldInfos(result.fieldInfos)
        }
        ToolRefs.getLoading()?.setLoading(false)
      } catch (error) {
        ToolRefs.getLoading()?.setLoading(false)
      }
    })
  }
  /**
   * 打开文件管理器，选择 shp 文件
   */
  const openDictShp = async () => {
    NativeHTools?.openDoc({
      fileSuffixFilters: ['文档|shp,dbf,prj,shx'],
      // 默认文件路径
      defaultFilePathUri: 'file://docs/storage/Users/currentUser/test',
    }).then(async (files) => {
      const client = WebMapUtil.getClient()
      if (!client || files.length <= 0) return
      ToolRefs.getLoading()?.setLoading(true, {
        info: '正在导入数据...',
      })
      const contents: {
        type: "base64";
        fileName: string;
        base64: string;
      }[] = []
      let dsName = ''
      // 读取shp相关文件的base64内容，放到数组中
      for (const file of files) {
        const fileName = file.substring(file.lastIndexOf('/') + 1)
        const _path = decodeURI(file.split('file://docs')[1])
        console.log('_path', _path)
        const content = await RNFS.readFile(_path, 'base64')
        // const content = await NativeHTools?.readFile(file, 'base64')

        if (!dsName) {
          dsName = fileName.substring(0, fileName.lastIndexOf('.'))
        }

        content && contents.push({
          type: "base64",
          fileName: fileName,
          base64: content,
        })
      }

      try {
        // 解析文件base64内容，转为geojson格式数据
        const f = await client.dataConverter.shp2Geojson(contents)
        for (const _f of f) {
          _f && await MapUtil.importGeojson(_f, dsName)
        }
        ToolRefs.getLoading()?.setLoading(false)
      } catch (error) {
        ToolRefs.getLoading()?.setLoading(false)
      }
    })
  }



  /**
   * 打开文件管理器，选择 shp 的zip文件
   */
  const openDictShpZip = async () => {
    NativeHTools?.openDoc({
      fileSuffixFilters: ['文档|zip'],
      maxSelectNumber: 1, // 最大选择数量
      // 默认文件路径
      defaultFilePathUri: 'file://docs/storage/Users/currentUser/test',
    }).then(async (files) => {
      const client = WebMapUtil.getClient()
      if (!client || files.length <= 0) return
      ToolRefs.getLoading()?.setLoading(true, {
        info: '正在解压数据...',
      })
      const fileName = files[0].substring(files[0].lastIndexOf('/') + 1)
      const fileNameWithoutExt = files[0].substring(files[0].lastIndexOf('/') + 1, files[0].lastIndexOf('.'))

      const zipFile = RNFS.DocumentDirectoryPath + '/' + fileName
      const targetDirPath = RNFS.DocumentDirectoryPath + '/' + fileNameWithoutExt

      // 把zip文件从外部目录拷贝到内部目录
      await NativeHTools?.copyDir(files[0], zipFile)
      // 把内部目录的zip文件解压
      await NativeHTools?.unzipFile(zipFile, RNFS.DocumentDirectoryPath)
      // 读取解压后的文件目录
      let _files: string[] = await RNFS.readdir(targetDirPath) || []
      if (!_files) return
      // 补全文件路径
      _files = _files.map((item: string) => targetDirPath + '/' + item)
      ToolRefs.getLoading()?.setLoading(true, {
        info: '正在导入数据...',
      })
      const contents: {
        type: "base64";
        fileName: string;
        base64: string;
      }[] = []
      let dsName = ''
      // 读取shp相关文件的base64内容，放到数组中
      for (const file of _files) {
        const fileName = file.substring(file.lastIndexOf('/') + 1)
        const _path = decodeURI(file.split('file://docs')[1])
        console.log('_path', _path)
        const content = await RNFS.readFile(_path, 'base64')
        // const content = await NativeHTools?.readFile(file, 'base64')

        if (!dsName) {
          dsName = fileName.substring(0, fileName.lastIndexOf('.'))
        }

        content && contents.push({
          type: "base64",
          fileName: fileName,
          base64: content,
        })
      }

      try {
        // 解析文件base64内容，转为geojson格式数据
        const f = await client.dataConverter.shp2Geojson(contents)
        for (const _f of f) {
          _f && await MapUtil.importGeojson(_f, dsName)
        }
        // 删除内部zip包和解压后的文件夹
        await RNFS.unlink(zipFile)
        await RNFS.unlink(targetDirPath)
        ToolRefs.getLoading()?.setLoading(false)
      } catch (error) {
        ToolRefs.getLoading()?.setLoading(false)
      }
    })
  }

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
        }}
      >
        <View
          style={{
            width: '30%',
            marginLeft: 10,
          }}>
          <ImageButton
            style={styles.methodBtn}
            image={getAssets().icon_import}
            title={'Geojson'}
            onPress={openDictGeoJson}
          />
          <ImageButton
            style={styles.methodBtn}
            image={getAssets().icon_import}
            title={'Excel'}
            onPress={openDictExcel}
          />
          <ImageButton
            style={styles.methodBtn}
            image={getAssets().icon_import}
            title={'Shp'}
            onPress={openDictShp}
          />
          <ImageButton
            style={styles.methodBtn}
            image={getAssets().icon_import}
            title={'Shp Zip'}
            onPress={openDictShpZip}
          />
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
      ToolRefs.getToast()?.show('请先选择经纬度字段', 2000)
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
        ToolRefs.getToast()?.show('导入失败', 2000)
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
    height: 50,
    width: 40,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginTop: 20
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