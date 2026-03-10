/*
 * @Author: xiezhiyan 16297996+xiezhiyan@users.noreply.github.com
 * @Date: 2025-08-18 16:01:08
 * @LastEditors: xiezhiyan 16297996+xiezhiyan@users.noreply.github.com
 * @LastEditTime: 2025-10-27 18:46:40
 * @FilePath: /web2dsdkrn/src/components/WebmapView.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Client, createRNClient } from "@mapplus/react-native-webmap"
import React, { useMemo, useRef } from "react"
import { View } from "react-native"
import WebView from "react-native-webview"
import { DemoStackNavigationProps, DemoStackParamList } from 'src/navigators/types'
import { getAssets } from '../assets'
import ImageButton from './ImageButton'

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

  const renderBackBtn = () => {
    if (!props.navigation) {
      return null
    }
    return (
      <ImageButton
        image={getAssets().icon_back}
        onPress={() => {
          props.navigation?.goBack()
        }}
        style={{
          position: 'absolute',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          top: 10,
          left: 10,
          width: 40,
          height: 40,
          // zIndex: 100,
          borderRadius: 4,
        }}
      />
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
        mediaPlaybackRequiresUserAction = {false}
        onMessage={e => {
          // 处理来自 webview 中 webmap3d sdk 发来的消息
          client.handleMessage(e.nativeEvent.data)
        }}
        onLoadEnd={() => {
          // 加载完成后，初始化 client 对象，与 webview 中的 webmap3d sdk 建立联系
          // 初始化完成后才可以调用 sdk 中的各个方法
          client.init(undefined, { clientPort: 9988 }).then(() => {
            props.onInited(client)
          })
        }}
        webviewDebuggingEnabled={true}

        // 本地的web服务地址，包含实际的 sdk 代码引用
        source={{ uri: props.clientUrl }}
      />
      
      {renderBackBtn()}
      {props.children}
    </View>
  )
}