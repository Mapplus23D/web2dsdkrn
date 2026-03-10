import {
  Client,
  ExcelData,
  IDatasource,
  IFieldInfo,
  ILicenseInfo,
  RTNWebMap,
} from '@mapplus/react-native-webmap';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getAssets } from '../../assets';
import { ImageButton } from '../../components';
import WebmapView from '../../components/WebmapView';
import BaseLayerData from '../../constants/BaseLayerData';
import { DemoStackPageProps } from '../../navigators/types';
import { LicenseUtil, MapUtil, ToolRefs, WebMapUtil } from '../../utils';

interface Props extends DemoStackPageProps<'DataImport'> {}

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
  const [license, setLicense] = useState<ILicenseInfo | undefined>();
  const [clientUrl, setClientUrl] = useState<string | undefined>();

  // excel 数据
  const [excelData, setExcelData] = useState<ExcelData>();
  const [xName, setXName] = useState('');
  const [yName, setYName] = useState('');
  const [fieldInfos, setFieldInfos] = useState<IFieldInfo[]>([]);
  const [fileName, setFileName] = useState('');

  /** 激活许可 */
  const initLicense = () => {
    LicenseUtil.active().then(res => {
      setLicense(res);
    });
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
  };

  useEffect(() => {
    // 1. 激活 sdk 许可
    initLicense();
    return () => {
      // 退出页面，关闭地图
      WebMapUtil.getClient()?.mapControl.closeMap();
      WebMapUtil.setClient(null);
    };
  }, []);

  useEffect(() => {
    if (license) {
      // 2. 获取 sdk web 服务地址
      const res = RTNWebMap.getClientUrl();
      if (res) {
        setClientUrl(res);
      }
    }
  }, [license]);

  const _onLoad = (client: Client) => {
    // 3. 场景加载后，初始化图层
    WebMapUtil.setClient(client);
    initLayers();
  };

  function addLayerFromSources(sources: IDatasource[]) {
    const client = WebMapUtil.getClient();
    if (!client) return;

    sources.forEach(s => {
      if (s.type === 'geojson') {
        MapUtil.addLayer({
          geometryType: s.geometryType,
          dsId: s.id,
          name: s.name,
        });
      }
    });
  }

  /**
   * 打开文件管理器，选择文件
   */
  const openDictGeoJson = async () => {
    const client = WebMapUtil.getClient();
    if (!client) return;

    console.log('RTNWebMap', RTNWebMap);

    const res = await RTNWebMap.pickFileUri({ filter: ['json'] });
    if (res.length === 0) return;

    ToolRefs.getLoading()?.setLoading(true, {
      info: '正在导入数据...',
    });

    const sources = await client.datasources.createFromGeoJSONFile(
      res[0].name,
      res[0].uri,
    );
    addLayerFromSources(sources);

    ToolRefs.getLoading()?.setLoading(false);
  };
  /**
   * 打开文件管理器，选择 Excel 文件
   */
  const openDictExcel = async () => {
    const client = WebMapUtil.getClient();
    if (!client) return;

    const res = await RTNWebMap.pickFileUri({ filter: ['xlsx'] });
    if (res.length === 0) return;

    ToolRefs.getLoading()?.setLoading(true, {
      info: '正在导入数据...',
    });

    const data = await client.dataConversion.readExcelFile(res[0].uri, {
      firstLineAsFieldInfo: true,
    });
    setExcelData(data);
    if (data) {
      setFileName(res[0].name);
      setFieldInfos(data.fieldInfos);
    }

    ToolRefs.getLoading()?.setLoading(false);
  };
  /**
   * 打开文件管理器，选择 shp 文件
   */
  const openDictShp = async () => {
    const client = WebMapUtil.getClient();
    if (!client) return;

    // todo android
    const res = await RTNWebMap.pickFileUri({ filter: ['shp,dbf,prj,shx'] });
    if (res.length === 0) return;

    ToolRefs.getLoading()?.setLoading(true, {
      info: '正在导入数据...',
    });

    const sources = await client.datasources.createFromSHPFile(
      res.map(r => r.uri),
    );
    addLayerFromSources(sources);

    ToolRefs.getLoading()?.setLoading(false);
  };

  /**
   * 打开文件管理器，选择 shp 的zip文件
   */
  const openDictShpZip = async () => {
    const client = WebMapUtil.getClient();
    if (!client) return;

    const res = await RTNWebMap.pickFileUri({ filter: ['zip'] });
    if (res.length === 0) return;

    ToolRefs.getLoading()?.setLoading(true, {
      info: '正在导入数据...',
    });

    console.log('import source');

    const sources = await client.datasources.createFromSHPFile(res[0].uri);
    console.log('import source', sources);
    addLayerFromSources(sources);

    ToolRefs.getLoading()?.setLoading(false);
  };

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
        }}>
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
    );
  };

  const _renderListItem = (section: number, item: IFieldInfo) => {
    return (
      <TouchableOpacity
        key={`${section}-${item.name}`}
        style={{
          padding: 10,
          borderBottomWidth: 1,
          borderBottomColor: '#ccc',
          backgroundColor:
            (section === 1 && item.name === xName) ||
            (section === 2 && item.name === yName)
              ? '#e0f7fa'
              : '#fff',
        }}
        onPress={() => {
          if (section === 1) {
            setXName(item.name);
          } else if (section === 2) {
            setYName(item.name);
          }
        }}>
        <Text>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const cancel = () => {
    setExcelData(undefined);
    setFieldInfos([]);
    setXName('');
    setYName('');
    setFileName('');
  };

  const submit = async () => {
    const client = WebMapUtil.getClient();
    if (!client) return;

    if (!excelData || !xName || !yName) {
      ToolRefs.getToast()?.show('请先选择经纬度字段', 2000);
      return;
    }

    const sources = await client.datasources.createFromExcelData(
      'excelData',
      excelData,
      {
        type: 'coordinate',
        x: xName,
        y: yName,
      },
    );
    if (sources) {
      addLayerFromSources([sources])
      // 导入成功后，清空选择
      cancel();
    } else {
      ToolRefs.getToast()?.show('导入失败', 2000);
    }
  };

  const _renderXYModel = () => {
    if (fieldInfos.length <= 0) return;
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
          <ScrollView style={styles.modelList}>
            {fieldInfos.map((item, index) => _renderListItem(1, item))}
          </ScrollView>
          <ScrollView style={styles.modelList}>
            {fieldInfos.map((item, index) => _renderListItem(2, item))}
          </ScrollView>
        </View>
        <View style={styles.modelBottom}>
          <TouchableOpacity style={styles.modelBtn} onPress={cancel}>
            <Text style={{ color: '#fff', textAlign: 'center' }}>取消</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modelBtn} onPress={submit}>
            <Text style={{ color: '#fff', textAlign: 'center' }}>导入</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!license || !clientUrl) return null;

  return (
    <>
      <WebmapView
        clientUrl={clientUrl}
        onInited={_onLoad}
        navigation={props.navigation}>
        {_renderTools()}
        {_renderXYModel()}
      </WebmapView>
    </>
  );
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
    marginTop: 20,
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
