/**
 * 地图打开保存
 */
import { Client, ILicenseInfo, IWebMap, RTNWebMap } from '@mapplus/react-native-webmap'
import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { getAssets } from '../../assets'
import { ImageButton, WebmapView } from '../../components'
import BaseLayerData from '../../constants/BaseLayerData'
import { DemoStackPageProps } from '../../navigators/types'
import NativeHTools from '../../specs/v1/NativeHTools'
import { LicenseUtil, ToolRefs, WebMapUtil } from '../../utils'

interface Props extends DemoStackPageProps<'MapOpenSave'> { }

/**
 * 地图打开保存
 * @param props 
 * @returns 
 */
export default function MapOpenSave(props: Props) {
  const [license, setLicense] = useState<ILicenseInfo | undefined>()
  const [clientUrl, setClientUrl] = useState<string | undefined>()

  /** 激活许可 */
  const initLicense = () => {
    LicenseUtil.active().then(res => {
      setLicense(res)
    })
  }

  const onLoad = (client: Client) => {
    WebMapUtil.setClient(client);
    // 初始化底图
    initLayers()
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
    // 激活 sdk 许可
    initLicense()
    return () => {
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
   * 打开地图
   */
  const open = async () => {
    // 打开本地文件管理器，选择地图文件
    // 二维地图文件是json格式
    NativeHTools?.openDoc({
      fileSuffixFilters: ['文档|json'],
      // 默认文件路径
      defaultFilePathUri: 'file://docs/storage/Users/currentUser/test',
      maxSelectNumber: 1,
    }).then(async (files) => {
      const client = WebMapUtil.getClient()
      if (!client || files.length <= 0) return
      ToolRefs.getLoading()?.setLoading(true, {
        info: '正在打开地图...',
      })

      try {
        // 读取文件
        const content = await NativeHTools?.readFile(files[0])

        if (!content) return

        // 地图数据字符串转成对象
        const mapJson = JSON.parse(content) as IWebMap

        // 打开地图
        await client.mapControl.openMap(mapJson)

        ToolRefs.getLoading()?.setLoading(false)
      } catch (error) {
        ToolRefs.getLoading()?.setLoading(false)
      }
    })
  }

  /**
   * 保存地图
   * @returns 
   */
  const save = async () => {
    const client = WebMapUtil.getClient()
    if (!client) return
    const map = await client.mapControl.getMap()
    NativeHTools?.openDocSave({
      // 默认文件路径
      defaultFilePathUri: 'file://docs/storage/Users/currentUser/test',
      newFileNames: ['Map_' + new Date().getTime()],
      fileSuffixChoices: ['.json'],
    }).then(async (files) => {
      NativeHTools?.writeFile(files[0], JSON.stringify(map)).then((res) => {
        if (res) {
          ToolRefs.getToast()?.show('地图已保存到：' + files[0], 3000)
        } else {
          ToolRefs.getToast()?.show('地图保存失败')
        }
      })
    })
  }

  /**
   * 关闭地图
   * @returns 
   */
  const close = async () => {
    const client = WebMapUtil.getClient()
    if (!client) return
    // 关闭地图
    await client.mapControl.closeMap()
    // 加载默认底图
    initLayers()
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
          <ImageButton
            style={styles.methodBtn}
            title={'打开'}
            image={getAssets().icon_doc}
            onPress={open}
          />
          <ImageButton
            style={styles.methodBtn}
            title={'保存'}
            image={getAssets().icon_save}
            onPress={save}
          />
          <ImageButton
            style={styles.methodBtn}
            title={'关闭'}
            image={getAssets().icon_close}
            onPress={close}
          />
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
      {renderTools()}
    </WebmapView>
  )
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
    marginTop: 20
  },
});