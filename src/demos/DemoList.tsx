/*
 * @Author: xiezhiyan 16297996+xiezhiyan@users.noreply.github.com
 * @Date: 2025-07-09 17:18:54
 * @LastEditors: xiezhiyan 16297996+xiezhiyan@users.noreply.github.com
 * @LastEditTime: 2025-10-09 14:20:27
 * @FilePath: /web2dsdkrn/src/demos/DemoList.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Image, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DemoStackPageProps, DemoStackParamList } from 'src/navigators/types';
import { getAssets } from '../assets';

interface DemoItem {
  title: string;
  path: keyof DemoStackParamList
}

interface Props extends DemoStackPageProps<'DemoList'> {

}

const DemoList = ({ navigation }: Props) => {
  const DATA: {
    title: string;
    data: DemoItem[];
  }[] = [
      {
        title: '基础地图',
        data: [
          {
            title: '底图数据',
            path: 'BaseMap',
          },
          // {
          //   title: '地图样式',
          //   path: 'MapStyle',
          // },
          // {
          //   title: '地图定位',
          //   path: 'MapLocation',
          // },
        ],
      },
      {
        title: '底图覆盖物',
        data: [
          {
            title: '数据导入',
            path: 'DataImport',
          },
          {
            title: '保存打开',
            path: 'MapOpenSave',
          },
          {
            title: '对象绘制',
            path: 'DrawObject',
          },
          {
            title: '文本绘制',
            path: 'DrawText',
          },
          {
            title: '对象编辑',
            path: 'ObjectEdit',
          },
          {
            title: '对象属性',
            path: 'ObjectAttribute',
          },
          {
            title: '图层样式',
            path: 'LayerStyle',
          },
          {
            title: '专题图',
            path: 'ThemeLayer',
          },
        ],
      },
      {
        title: '地图工具',
        data: [
          {
            title: '测量',
            path: 'Measure',
          },
          {
            title: '数据分析',
            path: 'Analyst',
          },
          {
            title: '地图导航',
            path: 'Navigation',
          },
        ],
      },
    ];

  const handlePress = (item: DemoItem) => {
    item.path && navigation.navigate(item.path)
  };

  const renderItem = ({ item }: { item: DemoItem }) => (
    <TouchableOpacity onPress={() => handlePress(item)} style={styles.item}>
      <Text style={styles.itemText}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <View style={styles.header}>
      <Text style={styles.headerText}>{title}</Text>
    </View>
  );

  const renderHeader = () => {
    return (
      <View style={styles.headerView}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Image style={styles.backImg} source={getAssets().icon_back} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SDK示例</Text>
      </View>
    )
  }

  return (
    <View>
      {renderHeader()}
      <SectionList
        sections={DATA}
        keyExtractor={(item, index) => item.title + index}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.container}
        style={{ height: '92%' }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    backgroundColor: '#f4f4f4',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  item: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 4,
    marginBottom: 8,
    elevation: 1,
  },
  itemText: {
    fontSize: 14,
  },
  headerView: {
    backgroundColor: '#fff',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  backBtn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40,
  },
  backImg: {
    height: 24,
    width: 24,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    textAlign: 'center',
    marginRight: 50,
  },
});

export default DemoList;