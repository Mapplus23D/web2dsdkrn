/**
 * 标注Demo
 */
import {
  Client,
  IGeoJSONFeature,
  ILicenseInfo,
  IPoint2D,
  RTNWebMap,
} from '@mapplus/react-native-webmap';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getAssets } from '../../assets';
import { WebmapView } from '../../components';
import BaseLayerData from '../../constants/BaseLayerData';
import { DemoStackPageProps } from '../../navigators/types';
import { DataUtil, LicenseUtil, WebMapUtil } from '../../utils';

interface Props extends DemoStackPageProps<'MapCallout'> {}

/**
 * 标注Demo
 * @param props
 * @returns
 */
export default function MapCallout(props: Props) {
  const [license, setLicense] = useState<ILicenseInfo | undefined>();
  const [clientUrl, setClientUrl] = useState<string | undefined>();

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

    // 定位到初始位置
    flyToInitPosition();
  };
  useEffect(() => {
    // 激活 sdk 许可
    initLicense();
    return () => {
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

  /** 添加callout */
  const _addCallout = async () => {
    const client = WebMapUtil.getClient();
    if (!client) return;
    const llPoint = await getDrawPosition();
    // if (llPoint) {
    //   client.mapControl.addCallout('tag_' + new Date().toTimeString(), {
    //     location: llPoint,
    //     html: `<div style="width: 100px; height:80px; background-color: #FFFF00">标注-${new Date()}</div>`,
    //   })
    // }
  };

  /** 画图中心点 */
  const _renderAim = () => {
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

  /** 工具栏 */
  const _renderBar = () => {
    return (
      <View style={styles.textBar}>
        <TouchableOpacity onPress={_addCallout} style={styles.bottomBtn}>
          <Text style={[styles.bottomBtnText, { fontSize: 30 }]}>+</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (!license || !clientUrl) return null;

  return (
    <WebmapView
      clientUrl={clientUrl}
      onInited={onLoad}
      navigation={props.navigation}>
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
    justifyContent: 'center',
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
