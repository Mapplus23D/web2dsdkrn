/**
 * 标注Demo
 */
import {
  Client,
  IGeoJSONFeature,
  ILicenseInfo,
  INavigationResultInfo,
  INavigationSubInfo,
  IPoint2D,
  RTNWebMap,
} from '@mapplus/react-native-webmap';
import { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getAssets } from '../../assets';
import { ImageButton, WebmapView } from '../../components';
import BaseLayerData from '../../constants/BaseLayerData';
import { DemoStackPageProps } from '../../navigators/types';
import { DataUtil, LicenseUtil, WebMapUtil } from '../../utils';
import NavigationComponent from '../../components/NavigationComponent';
import { navDataTest } from './navData';
import NativeHTools from '../../specs/v1/NativeHTools';

interface Props extends DemoStackPageProps<'Navigation'> {}

/**
 * 标注Demo
 * @param props
 * @returns
 */
export default function Navigation(props: Props) {
  const [license, setLicense] = useState<ILicenseInfo | undefined>();
  const [clientUrl, setClientUrl] = useState<string | undefined>();

  const [headingUp, setHeadingUp] = useState<boolean>(false);
  const [navPause, setNavPause] = useState<boolean>(false);
  const [navData, setNavData] = useState<INavigationResultInfo | undefined>(
    undefined,
  );
  const [navSpeed, setNavSpeed] = useState<number>(1.0);
  // const [navStart, setNavStart] = useState<boolean>(false)

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
    await client.mapControl.setDynamicProjection(true);
    const dss = await BaseLayerData.image[3].action();
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
   * 初始化导航
   * @returns
   */
  const initNav = async () => {
    console.log('导航初始化');
    const client = WebMapUtil.getClient();
    if (!client) return;

    //初始化导航实例，要在地图加载完成后
    await client.navigation.initNavigation();

    const navData = JSON.parse(navDataTest);
    const start = navData.Rings[0].Points[0];
    const end = navData.Rings[0].Points[navData.Rings[0].Points.length - 1];

    //设置导航起点
    await client.navigation.setStartPos({
      longitude: start.X,
      latitude: start.Y,
    });
    //设置导航终点
    await client.navigation.setEndPosPos({ longitude: end.X, latitude: end.Y });

    const routes = navData.simples.Itmes;

    let navInfos: INavigationSubInfo[] = [];
    for (let i = 0; i < routes.length; i++) {
      const navInfo1: INavigationSubInfo = {
        streeName: '',
        routeCoordinates: [],
      };
      const route = routes[i];
      navInfo1.streeName = route.linkStreetName;

      const points = route.streetLatLon.split(';');
      for (let pointstr of points) {
        const pointsPart = pointstr.split(',');
        navInfo1.routeCoordinates.push({
          latitude: Number(pointsPart[1]),
          longitude: Number(pointsPart[0]),
        });
      }
      navInfos.push(navInfo1);
    }

    // 设置导航路径信息
    const b = await client.navigation.setRouteInfo({
      navigationSubInfo: navInfos,
    });

    //     //设置导航起点
    // await client.navigation.setStartPos({longitude:116.404, latitude:39.915})
    // //设置导航终点
    // await client.navigation.setEndPosPos({longitude:116.418, latitude:39.924})
    // const navInfo1: INavigationSubInfo = {
    //   streeName: '天府大道',
    //   routeCoordinates: [
    //     {longitude:116.404,latitude: 39.915},
    //     {longitude:116.408,latitude: 39.918},
    //   ]
    // }
    // const navInfo2: INavigationSubInfo = {
    //   streeName: '科华南路',
    //   routeCoordinates: [
    //     {longitude:116.408,latitude: 39.918},
    //     {longitude:116.412,latitude: 39.920},
    //   ]
    // }
    //  const navInfo3: INavigationSubInfo = {
    //   streeName: '成华大道',
    //   routeCoordinates: [
    //     {longitude:116.412,latitude: 39.920},
    //     {longitude:116.415,latitude: 39.922},
    //   ]
    // }
    //  const navInfo4: INavigationSubInfo = {
    //   streeName: '麓山大道',
    //   routeCoordinates: [
    //     {longitude:116.415,latitude: 39.922},
    //     {longitude:116.418,latitude: 39.924}
    //   ]
    // }

    // // //设置导航路径信息
    // const b = await client.navigation.setRouteInfo({navigationSubInfo:[navInfo1,navInfo2,navInfo3,navInfo4]})
    console.log('设置数据状态', b);
    //设置导航信息回调
    client.addListener('onNavgationInfoChange', param => {
      // const res : INavigationResultInfo | undefined = navInfo.navInfo
      // console.log(param.navGuideState)
      // if(param.navGuideState === 'stop'){
      //   setNavData(undefined)
      //   return
      // }
      setNavData(param.navInfo);
      // console.log(param.navInfo)
    });

    NativeHTools.initTTS();
    client.addListener('onNavgationAudioMessageChange', param => {
      console.log(param.message);
      NativeHTools.speak(param.message);
    });
    // await client.navigation.setNavigationInfoUpdateCallback((navState, info)=>{
    //   console.log(navState)
    //   console.log(info)
    // })
  };

  /**
   * 设置导航路径
   * @returns
   */
  const navStart = async () => {
    console.log('导航开始');
    const client = WebMapUtil.getClient();
    if (!client) return;
    await client.navigation.setSpeed(0.1);
    await client.navigation.start('Simulated');
  };

  /**
   * 设置导航暂停&恢复
   * @returns
   */
  const navPauseFunc = async () => {
    const client = WebMapUtil.getClient();
    if (!client) return;
    setNavPause(!navPause);
    if (navPause) {
      console.log('导航恢复');
      await client.navigation.resume();
    } else {
      console.log('导航暂停');
      await client.navigation.pause();
    }
  };

  /**
   * 设置导航停止
   * @returns
   */
  const navEnd = async () => {
    console.log('导航停止');
    const client = WebMapUtil.getClient();
    if (!client) return;
    NativeHTools.stopSpeak();
    await client.navigation.stop();
  };

  /**
   * 设置车头向上
   * @returns
   */
  const setHeadingUpFunc = async () => {
    console.log('车头向上');
    const client = WebMapUtil.getClient();
    if (!client) return;
    setHeadingUp(!headingUp);
    await client.navigation.setHeadingUp(!headingUp);
  };

  /**
   * 设置车头向上
   * @returns
   */
  const speedArr = [0.5, 1.0, 2.0, 5.0, 10.0];
  const indexRef = useRef(0);
  const setNavSpeedFunc = async () => {
    console.log('设置导航速度');
    const client = WebMapUtil.getClient();
    if (!client) return;
    const s = speedArr[indexRef.current++ % speedArr.length];

    setNavSpeed(s);
    await client.navigation.setSpeed(s);
  };
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
          left: 10,
          width: 60,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
        <ImageButton
          style={[styles.methodBtn]}
          title={'初始化导航'}
          onPress={initNav}
        />
        <ImageButton
          style={[styles.methodBtn]}
          title={'导航开始'}
          onPress={navStart}
        />
        <ImageButton
          style={[styles.methodBtn]}
          title={navPause === false ? '导航暂停' : '导航恢复'}
          onPress={navPauseFunc}
        />
        <ImageButton
          style={[styles.methodBtn]}
          title={'导航停止'}
          onPress={navEnd}
        />
        <ImageButton
          style={[styles.methodBtn]}
          title={headingUp === true ? '地图指北' : '车头向上'}
          onPress={setHeadingUpFunc}
        />
        <ImageButton
          style={[styles.methodBtn]}
          title={'速度:' + navSpeed + ''}
          onPress={setNavSpeedFunc}
        />
      </View>
    );
  };

  if (!license || !clientUrl) return null;

  return (
    <WebmapView
      clientUrl={clientUrl}
      onInited={onLoad}
      navigation={props.navigation}>
      {renderTools()}
      <NavigationComponent navdata={navData} />
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
