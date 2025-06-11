import { ILicenseInfo, RTNWebMap } from '@mapplus/react-native-webmap';
import { useEffect, useRef, useState } from 'react';
import { Animated, SectionList, SectionListData, SectionListRenderItemInfo, Text, TouchableOpacity, View } from 'react-native';
import WebmapView from '../../components/WebmapView';
import BaseLayerData, { BaseLayerItem } from '../../constants/BaseLayerData';
import { DemoStackPageProps } from '../../navigators/types';
import { LicenseUtil, WebMapUtil } from '../../utils';

interface Props extends DemoStackPageProps<'BaseMap'> { }

interface Section {
  title: string
  data: BaseLayerItem[]
}

export default function BaseMap(props: Props) {
  const [license, setLicense] = useState<ILicenseInfo | undefined>()
  const [clientUrl, setClientUrl] = useState<string | undefined>()
  const [panelVisible, setPanelVisible] = useState(false)
  const [layerData, setLayerData] = useState<Section[]>([])

  const currentBaseLayers = useRef<string[]>([])

  const rotateValue = useRef(new Animated.Value(0)).current; // 初始角度为0度

  /** 激活许可 */
  const initLicense = () => {
    LicenseUtil.active().then(res => {
      setLicense(res)
    })
  }

  /** 初始化数据 */
  const initData = () => {
    setLayerData([
      {
        title: '影像图层',
        data: BaseLayerData.image,
      },
      {
        title: '矢量图层',
        data: BaseLayerData.vector,
      },
    ])
  }

  useEffect(() => {
    // 激活 sdk 许可
    initLicense()
    initData()
  }, [])

  useEffect(() => {
    // 激活sdk后，初始化
    if (license) {
      // 获取 sdk web 服务地址
      const res = RTNWebMap?.getClientUrl()
      if (res) {
        setClientUrl(res)
      }
      // initData()
    }
    return () => {
      // Web3dUtils.getClient()?.scene.close()
      // Web3dUtils.setClient(null)
    }
  }, [license])

  useEffect(() => {
    // 添加按钮旋转动画
    Animated.timing(rotateValue, {
      toValue: panelVisible ? 45 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [panelVisible])

  const initLayers = async () => {
    const client = WebMapUtil.getClient()
    if (!client) return

    changeBaseLayer(BaseLayerData.vector[0])
  }

  /**
   * 移动到指定位置到指定点位
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

  /**
   * 切换底图
   * @param data 底图数据
   * @returns 
   */
  const changeBaseLayer = async (data: BaseLayerItem) => {
    const client = WebMapUtil.getClient();
    if (!client) return
    // 临时储存当前添加的底图id
    const tempIds = []
    const dss = await data.action()
    for (const ds of dss) {
      if (ds) {
        // 添加底图
        const id = await client.baseLayers.add({
          sourceId: ds.id,
          name: ds.name,
          type: 'image'
        })
        id && tempIds.push(id)
      }
    }
    if (tempIds.length > 0) {
      // 移除之前的底图
      if (currentBaseLayers.current.length > 0) {
        for (const id of currentBaseLayers.current) {
          client.baseLayers.remove(id)
        }
      }
      // 记录当前的底图id
      currentBaseLayers.current = tempIds
    }
  }

  const _renderSection = (info: { section: SectionListData<BaseLayerItem, Section> }) => {
    return (
      <View
        style={{ flexDirection: 'row', marginBottom: 6, alignItems: 'center', backgroundColor: 'transparent' }}>
        <Text style={[{ fontSize: 16, color: '#333', marginTop: 10, marginBottom: 10 }]}>{info.section.title}</Text>
      </View>
    )
  }

  const _renderItem = ({ section, index }: SectionListRenderItemInfo<BaseLayerItem, Section>) => {
    console.log(section.data[index].title)
    return (
      <TouchableOpacity
        key={index}
        style={{
          marginBottom: 8,
          borderRadius: 8,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#ddd',
        }}
        onPress={async () => {
          changeBaseLayer(section.data[index])
          setPanelVisible(false);
        }}
      >
        <Text style={{ textAlign: 'center', padding: 8 }}>{section.data[index].title}</Text>
      </TouchableOpacity>
    )
  }

  if (!clientUrl) return null

  return (
    <WebmapView
      clientUrl={clientUrl}
      onInited={client => {
        WebMapUtil.setClient(client);
        initLayers()
        flyToInitPosition()
      }}
      navigation={props.navigation}
    >
      <>
        <TouchableOpacity
          onPress={() => setPanelVisible(visible => !visible)}
          activeOpacity={0.8}
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            backgroundColor: '#007AFF',
            borderRadius: 30,
            width: 60,
            height: 60,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
          }}
        >
          <Animated.Text style={{
            color: 'white',
            fontSize: 36,
            transform: [{
              rotate: rotateValue.interpolate({
                inputRange: [0, 45],
                outputRange: ['0deg', '45deg']
              })
            }]
          }}>+</Animated.Text>
        </TouchableOpacity>

        {panelVisible && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              top: 0,
              right: 0,
              width: 300,
              backgroundColor: 'white',
              padding: 16,
            }}
          >
            <SectionList
              style={{ width: '100%' }}
              refreshing={false}
              sections={layerData}
              renderItem={_renderItem}
              renderSectionHeader={_renderSection}
              keyExtractor={(item, index) => index.toString()}
              initialNumToRender={15}
              ListFooterComponent={<View style={{ height: 8 }} />}
              showsVerticalScrollIndicator={false}
              stickySectionHeadersEnabled={false}
              contentContainerStyle={{ paddingBottom: 60 }}
            />
          </View>
        )}
      </>
    </WebmapView>
  )
}