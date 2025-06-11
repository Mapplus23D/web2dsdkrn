import { Client, createRNClient } from "@mapplus/react-native-webmap"
import React, { useMemo, useRef } from "react"
import { Image, TouchableOpacity, View } from "react-native"
import WebView from "react-native-webview"
import { DemoStackNavigationProps, DemoStackParamList } from 'src/navigators/types'
import { getAssets } from '../assets'

interface Props {
  clientUrl: string
  onInited: (client: Client) => void
  children?: React.ReactNode | React.ReactNode[]
  navigation?: DemoStackNavigationProps<keyof DemoStackParamList>
}

export default function WebmapView(props: Props) {
  const webViewRef = useRef<WebView>(null)

  // 调用 createSuperMap3D 创建一个 react-native 端专用的 client 对象
  // client 对象负责与 webview 中的 webmap3d sdk 进行通信
  const client = useMemo(() => {
    const client = createRNClient(() => {
      // 返回 webview 引用以便进行消息的发送
      return webViewRef.current
    })
    return client
  }, [])

  // useEffect(() => {
  //   return () => {
  //     client.mapControl?.close()
  //   }
  // }, [])

  const renderBackBtn = () => {
    if (!props.navigation) {
      return null
    }
    return (
      <TouchableOpacity
        style={{
          position: 'absolute',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          top: 10,
          left: 10,
          width: 40,
          height: 40,
          zIndex: 100,
          borderRadius: 4,
          backgroundColor: 'rgba(0,0,0,0.3)',
        }}
        onPress={() => {
          props.navigation?.goBack()
        }}
      >
        <Image
          source={getAssets().icon_back}
          style={[
            {
              height: 30,
              width: 30,
            },
          ]}
        />
      </TouchableOpacity>
    )
  }

  return (
    <View
      style={{
        width: '100%',
        height: '100%',
      }}>
      <WebView
        ref={webViewRef}
        ignoreSilentHardwareSwitch={true}
        onMessage={e => {
          // 处理来自 webview 中 webmap3d sdk 发来的消息
          client.handleMessage(e.nativeEvent.data)
        }}
        onLoadEnd={() => {
          // 加载完成后，初始化 client 对象，与 webview 中的 webmap3d sdk 建立联系
          // 初始化完成后才可以调用 sdk 中的各个方法
          client.init(undefined, { clientPort: 9999 }).then(() => {
            props.onInited(client)
          })
        }}
        // 本地的web服务地址，包含实际的 sdk 代码引用
        source={{ uri: props.clientUrl }}
      />
      {renderBackBtn()}
      {props.children}
    </View>
  )
}