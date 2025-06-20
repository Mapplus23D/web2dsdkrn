import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Animated, Easing, Modal, StyleSheet, Text, View, ViewStyle } from 'react-native'
import { getAssets } from '../assets'

interface LoadingProps {
  info?: string,
  visible?: boolean,
  timeout?: number,
  displayMode?: 'normal' | 'modal' | 'compoent',
  indicatorSize?: number | 'small' | 'large',
  indicatorColor?: string,
  style?: ViewStyle,
}

/** Loading ref暴露给外部使用的的Props */
export interface LoadingRefProps {
  setLoading: (visible: boolean, info?: LoadingProps) => void,
  isLoading: () => boolean,
}

/**
 * Loading组件
 */
export default forwardRef<LoadingRefProps, LoadingProps>(function Loading(props, ref): JSX.Element {
  const [visible, setVisible] = useState(props.visible || false)
  const [info, setInfo] = useState(props.info || '')
  const [displayMode, setDisplayMode] = useState(props.displayMode || 'modal')
  const [indicatorColor, setIndicatorColor] = useState(props.indicatorColor || 'white')
  const [indicatorSize, setIndicatorSize] = useState(props.indicatorSize || 'large')
  const [timeout, setLoadingTimeout] = useState(props.timeout === 0 ? 0 : (props.timeout || 5000))

  const rotateValue = useRef(new Animated.Value(0))
  const rotateAnimated = useRef(
    Animated.loop(
      Animated.timing(rotateValue.current, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
        isInteraction: false,
      }),
    ),
  ).current
  const spin = rotateValue.current.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  // 暴露方法给外部使用
  useImperativeHandle(ref, () => {
    return {
      setLoading(visible: boolean, info?: LoadingProps) {
        setVisible(visible)
        if (!info) {
          setInfo('')
        }
        info?.info && setInfo(info?.info)
        info?.displayMode && setDisplayMode(info?.displayMode)
        info?.indicatorColor && setIndicatorColor(info?.indicatorColor)
        info?.indicatorSize && setIndicatorSize(info?.indicatorSize)
        if (info?.timeout && info?.timeout >= 0) {
          setLoadingTimeout(info.timeout)
        }
      },
      isLoading() {
        return visible
      },
    }
  }, [visible, info, displayMode, indicatorColor, indicatorSize])

  let isLoop = false
  let timer = -1
  useEffect(() => {
    if (visible && !isLoop) {
      isLoop = true
      rotateAnimated.start()
      // 超时设置
      if (visible && timeout > 0) {
        timer = window.setTimeout(() => {
          setVisible(false)
          if (timer >= 0) {
            clearTimeout(timer)
            timer = -1
          }
        }, timeout)
      }
    } else {
      isLoop = false
      rotateAnimated.stop()
      rotateValue.current.setValue(0)
      if (timer >= 0) {
        timer = -1
        clearTimeout(timer)
      }
    }
  }, [visible])

  useEffect(() => {
    return () => {
      isLoop = false
      rotateAnimated.stop()
      rotateValue.current.setValue(0)
      if (timer >= 0) {
        timer = -1
        clearTimeout(timer)
      }
    }
  }, [])

  if (!visible) return <></>
  if (displayMode === 'modal') {
    return (
      <Modal
        visible={visible}
        transparent={true}
        // onRequestClose={() => { }}
        style={styles.container}
      >
        <View
          style={[
            styles.container,
          ]}
        >
          <View style={[styles.indicatorBlack, props.style]}>
            <Animated.Image
              source={getAssets().icon_loading}
              style={{
                width: 25, height: 25,
                transform: [
                  { rotate: spin },
                ],
              }}
              resizeMode={'contain'}
            />
            {info && <Text style={styles.title}>{info}</Text>}
          </View>
        </View>
      </Modal>
    )
  } else if (displayMode === 'compoent') {
    return (
      <View style={[styles.indicatorBlack, props.style]}>
        <Animated.Image
          source={getAssets().icon_loading}
          style={{
            width: 25, height: 25,
            transform: [
              { rotate: spin },
            ],
          }}
          resizeMode={'contain'}
        />
        {info && <Text style={styles.title}>{info}</Text>}
      </View>
    )
  } else {
    return (
      <View
        style={[
          styles.container,
        ]}
      >
        <View style={[styles.indicatorBlack, props.style]}>
          <Animated.Image
            source={getAssets().icon_loading}
            style={{
              width: 25, height: 25,
              transform: [
                { rotate: spin },
              ],
            }}
            resizeMode={'contain'}
          />
          {info && <Text style={styles.title}>{info}</Text>}
        </View>
      </View>
    )
  }
})

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 100001,
  },
  indicatorBlack: {
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: '#rgba(0, 0, 0, 0.5)',
    width: 100,
    height: 100,
    borderRadius: 4,
  },
  title: {
    width: 100,
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
  },
})