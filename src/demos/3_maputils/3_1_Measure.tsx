/**
 * 测量Demo
 *
 * 包含长度测量，面积测量，角度测量
 */
import {
  Client,
  IGeoJSONFeature,
  ILicenseInfo,
  RTNWebMap,
} from '@mapplus/react-native-webmap';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ImageButton, WebmapView } from '../../components';
import BaseLayerData from '../../constants/BaseLayerData';
import { DemoStackPageProps } from '../../navigators/types';
import { DataUtil, LicenseUtil, WebMapUtil } from '../../utils';

enum MeasureType {
  NULL,
  LENGTH,
  AREA,
  ANGLE,
}

interface Props extends DemoStackPageProps<'Measure'> {}

/**
 * 测量Demo
 * @param props
 * @returns
 */
export default function Measure(props: Props) {
  const [license, setLicense] = useState<ILicenseInfo | undefined>();
  const [clientUrl, setClientUrl] = useState<string | undefined>();

  const [measureValue, setMeasureValue] = useState('');
  const [measureType, setMeasureType] = useState<MeasureType>(MeasureType.NULL);

  /** 激活许可 */
  const initLicense = () => {
    LicenseUtil.active().then(res => {
      setLicense(res);
    });
  };

  const onLoad = (client: Client) => {
    WebMapUtil.setClient(client);
    // 添加测量监听
    addMeasureListener();
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

  const onMeasure = (event: {
    value: number;
    unit: string;
    isFinishied?: boolean;
  }) => {
    console.log(event);
    if (event.isFinishied) {
      setMeasureValue('');
      // window.removeEventListener('mousemove', updatePosition)
      return;
    }
    setMeasureValue(event.value + '');
    // window.addEventListener('mousemove', updatePosition)
  };

  /** 添加选择监听 */
  const addMeasureListener = () => {
    const client = WebMapUtil.getClient();
    if (!client) return;
    // 监听对象被选中事件
    client.addListener('onMeasureResult', onMeasure);
  };

  /** 移除选择监听 */
  const removeMeasureListener = () => {
    const client = WebMapUtil.getClient();
    if (!client) return;
    // 监听对象被选中事件
    client.removeListener('onMeasureResult', onMeasure);
  };

  useEffect(() => {
    // 激活 sdk 许可
    initLicense();
    return () => {
      removeMeasureListener();
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

  /** 提交 */
  const submit = () => {
    const client = WebMapUtil.getClient();
    if (!client) return;
    client.mapControl.submit();
  };

  /** 提交 */
  const undo = () => {
    const client = WebMapUtil.getClient();
    if (!client) return;
    client.mapControl.undo();
  };

  const cancle = () => {
    const client = WebMapUtil.getClient();
    if (!client) return;
    client.mapControl.deleteCurrentGeometry();
  };
  const clear = () => {
    const client = WebMapUtil.getClient();
    if (!client) return;
    // client.mapControl.setAction(client.Action.select)
    client.mapControl.clear();
  };
  const changeMeasureStyle = async () => {
    const client = WebMapUtil.getClient();
    if (!client) return;
    // client.mapControl.setAction(client.Action.pan)
    await client.mapControl.setMeasureTextShow(true);
    await client.mapControl.setMeasureLengthShowAngle(true);
    await client.mapControl.setMeasureAreaShowLength(true);
    await client.mapControl.setStrokeColor('rgb(255,0,0)');
    await client.mapControl.setStrokeFillColor('rgb(0,255,0)');
    await client.mapControl.setStrokeWidth(4);
    await client.mapControl.setNodeSize(8);
    await client.mapControl.setNodeColor('rgb(0,0,255)');
    await client.mapControl.setTextColor('rgb(0,255,255)');
    await client.mapControl.setTextHaloColor('rgb(255,0,255)');
    await client.mapControl.setTextHaloWidth(3);
  };
  /** 距离量算 */
  const lengthMeasure = async () => {
    const client = WebMapUtil.getClient();
    if (!client) return;
    const currentAction = await client.mapControl.getAction();
    if (currentAction === client.Action.measure_length) {
      client.mapControl.setAction(client.Action.select);
      setMeasureType(MeasureType.NULL);
    } else {
      client.mapControl.setAction(client.Action.measure_length);
      setMeasureType(MeasureType.LENGTH);
    }
  };

  /** 面积量算 */
  const areaMeasure = async () => {
    const client = WebMapUtil.getClient();
    if (!client) return;
    const currentAction = await client.mapControl.getAction();
    if (currentAction === client.Action.measure_area) {
      client.mapControl.setAction(client.Action.pan);
      setMeasureType(MeasureType.NULL);
    } else {
      client.mapControl.setAction(client.Action.measure_area);
      setMeasureType(MeasureType.AREA);
    }
  };

  /** 角度量算 */
  const angleMeasure = async () => {
    const client = WebMapUtil.getClient();
    if (!client) return;
    const currentAction = await client.mapControl.getAction();
    if (currentAction === client.Action.measure_angle) {
      client.mapControl.setAction(client.Action.pan);
      setMeasureType(MeasureType.NULL);
    } else {
      client.mapControl.setAction(client.Action.measure_angle);
      setMeasureType(MeasureType.ANGLE);
    }
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
          width: 40,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
        <ImageButton
          style={[styles.methodBtn]}
          title={'风格设置'}
          onPress={changeMeasureStyle}
        />
        <ImageButton
          style={[styles.methodBtn]}
          title={'清除'}
          onPress={clear}
        />
        <ImageButton
          style={[
            styles.methodBtn,
            measureType === MeasureType.LENGTH && {
              backgroundColor: '#3499E5',
            },
          ]}
          title={'距离'}
          onPress={lengthMeasure}
        />
        <ImageButton
          style={[
            styles.methodBtn,
            measureType === MeasureType.AREA && { backgroundColor: '#3499E5' },
          ]}
          title={'面积'}
          onPress={areaMeasure}
        />
        <ImageButton
          style={[
            styles.methodBtn,
            measureType === MeasureType.ANGLE && { backgroundColor: '#3499E5' },
          ]}
          title={'角度'}
          onPress={angleMeasure}
        />
      </View>
    );
  };

  /**
   * 侧边工具栏
   * @returns
   */
  const renderTools2 = () => {
    if (measureType !== MeasureType.NULL)
      return (
        <View
          style={{
            position: 'absolute',
            top: 80,
            right: 10,
            width: 40,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
          <ImageButton style={styles.methodBtn} title={'撤销'} onPress={undo} />
          <ImageButton
            style={styles.methodBtn}
            title={'确定'}
            onPress={submit}
          />
          <ImageButton
            style={styles.methodBtn}
            title={'取消'}
            onPress={cancle}
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
      {renderTools2()}
    </WebmapView>
  );
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
    marginTop: 20,
  },
});
