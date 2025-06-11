import { SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DemoStackPageProps, DemoStackParamList } from 'src/navigators/types';

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
          // {
          //   title: '几何图形',
          //   path: 'DrawObject',
          // },
          // {
          //   title: '文本绘制',
          //   path: 'DrawText',
          // },
          // {
          //   title: '数据导入',
          //   path: 'DataImport',
          // },
          // {
          //   title: '图层风格',
          //   path: 'LayerStyle',
          // },
          // {
          //   title: '对象编辑',
          //   path: 'ObjectEdit',
          // },
          // {
          //   title: '对象属性',
          //   path: 'ObjectAttribute',
          // },
          // {
          //   title: '保存打开',
          //   path: 'MapOpenSave',
          // },
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

  return (
    <SectionList
      sections={DATA}
      keyExtractor={(item, index) => item.title + index}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      contentContainerStyle={styles.container}
    />
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
});

export default DemoList;