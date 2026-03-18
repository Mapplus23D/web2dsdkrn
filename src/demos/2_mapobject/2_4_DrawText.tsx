import {
  AddSourceParam,
  ILicenseInfo,
  RTNWebMap,
} from '@mapplus/react-native-webmap';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getAssets } from '../../assets';
import WebmapView from '../../components/WebmapView';
import BaseLayerData from '../../constants/BaseLayerData';
import { DemoStackPageProps } from '../../navigators/types';
import { LicenseUtil, MapUtil, WebMapUtil } from '../../utils';

interface Props extends DemoStackPageProps<'DrawText'> {}

/**
 * 文本绘制Demo
 */
export default function DrawText(props: Props) {
  const [license, setLicense] = useState<ILicenseInfo | undefined>();
  const [clientUrl, setClientUrl] = useState<string | undefined>();

  /** 文本 */
  const textRef = useRef('');
  /** 记录文本ID */
  const textHistory = useRef<number[]>([]);
  /** 当前绘制图层 */
  const currentLayerInfo = useRef<{
    layerName: string;
    dsId: string;
  }>();
  /** 当前绘制对象 */
  const currentTextID = useRef<number>();

  /** 准星图标句柄 用于获取屏幕坐标 */
  const aimPointImageRef = useRef<Image>(null);

  useEffect(() => {
    // 激活 sdk 许可
    initLicense();
  }, []);

  useEffect(() => {
    // 激活sdk后，初始化
    if (license) {
      // 获取 sdk web 服务地址
      const res = RTNWebMap.getClientUrl();
      if (res) {
        setClientUrl(res);
      }
    }
    return () => {
      // 退出页面，关闭地图
      WebMapUtil.getClient()?.mapControl.closeMap();
      WebMapUtil.setClient(null);
    };
  }, [license]);

  /** 激活许可 */
  const initLicense = () => {
    LicenseUtil.active().then(res => {
      setLicense(res);
    });
  };

  const init = async () => {
    flyToInitPosition();
    await initLayers();
  };

  /** 初始化默认图层 */
  const initLayers = async () => {
    const webmap = WebMapUtil.getClient();
    if (!webmap) return;

    // 添加默认底图
    const dss = await BaseLayerData.image[0].action();
    for (const ds of dss) {
      ds &&
        (await webmap.baseLayers.add({
          sourceId: ds.id,
          name: ds.name,
          type: 'image',
        }));
    }

    // 添加文本图层
    addLayer({
      type: 'geojson',
      fieldInfos: [],
      geometryType: 'text',
      name: '',
    }).then(result => {
      currentLayerInfo.current = result;
    });
  };

  // 添加文本数据源和图层
  const addLayer = async (params: AddSourceParam) => {
    const webmap = WebMapUtil.getClient();
    if (!webmap) return;

    let result:
      | {
          dsId: string;
          layerName: string;
        }
      | undefined = undefined;

    // 添加数据源
    const dsId = await webmap.datasources.add(params);

    if (dsId) {
      // 添加图层
      const layer = await MapUtil.addLayer({
        dsId,
        geometryType: 'text',
        name: '',
      });
      if (layer) {
        result = {
          dsId,
          layerName: layer,
        };
      }
    }

    return result;
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
        x: 103.56990027694332,
        //维度
        y: 38.151379529059,
      },
      duration: 1000,
      scale: 4.4911532365316153e-8,
    });
  };

  /**
   * 绘制文本
   * @returns
   */
  const _drawText = () => {
    const client = WebMapUtil.getClient();
    if (!client) return;
    // 获取绘制图标在屏幕的位置
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
        // 屏幕坐标转为地理坐标
        const tempPoint = await client.mapControl.pxToMap({
          x: pointX,
          y: pointY,
        });
        if (!tempPoint || !currentLayerInfo.current) return;

        const textID = await client.recordset.addNew(
          currentLayerInfo.current.dsId,
          {
            type: 'text',
            text: textRef.current,
            textStyle: { textSize: 30, textColor: '#ffffff' },
            point: [tempPoint.x, tempPoint.y],
          },
        );
        textID !== undefined && textHistory.current.push(textID);
      },
    );
  };

  /** 撤销上一次绘制的文本 */
  const _undo = async () => {
    const client = WebMapUtil.getClient();
    if (!client || !currentLayerInfo.current) return;
    const textID = textHistory.current.pop();
    if (textID === undefined) return;
    await client.recordset.delete(currentLayerInfo.current.dsId, {
      ids: [textID],
    });
  };

  /** 准星 */
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

  /** 输入框组件 */
  const _renderTextBar = () => {
    return (
      <KeyboardAvoidingView behavior={'position'} keyboardVerticalOffset={36}>
        <View style={styles.textBar}>
          <TouchableOpacity onPress={_undo} style={styles.bottomBtn}>
            <Text style={styles.bottomBtnText}>撤销</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholderTextColor={'#000000ff'}
            onChangeText={text => {
              textRef.current = text;
            }}
          />
          <TouchableOpacity onPress={_drawText} style={styles.bottomBtn}>
            <Text style={styles.bottomBtnText}>添加</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  };
  if (!license || !clientUrl) return null;

  return (
    <WebmapView
      clientUrl={clientUrl}
      onInited={client => {
        WebMapUtil.setClient(client);
        init();
      }}
      navigation={props.navigation}>
      {_renderAim()}
      {_renderTextBar()}
    </WebmapView>
  );
}

const styles = StyleSheet.create({
  textBar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    backgroundColor: '#3499E5',
  },
  bottomBtnText: {
    color: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#efefef',
    height: 40,
    color: '#000',
    marginHorizontal: 10,
    borderRadius: 4,
    paddingHorizontal: 10,
  },
});
