import { createStackNavigator } from '@react-navigation/stack';
import BaseMap from '../demos/1_basemap/1_1_BaseMap';
import DrawObject from '../demos/2_mapobject/2_1_DrawObject';
import DrawText from '../demos/2_mapobject/2_2_DrawText';
import DataImport from '../demos/2_mapobject/2_3_DataImport';
import ObjectEdit from '../demos/2_mapobject/2_5_ObjectEdit';
import ThemeLayer from '../demos/2_mapobject/2_7_ThemeLayer';
import DemoList from '../demos/DemoList';
import Home from '../pages/Home';
import { DemoStackParamList } from './types';

const Stack = createStackNavigator<DemoStackParamList>();

export default function DemoStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="DemoHome" component={Home} />
      <Stack.Screen name="DemoList" component={DemoList} />
      <Stack.Screen name="BaseMap" component={BaseMap} />
      <Stack.Screen name="DrawObject" component={DrawObject} />
      <Stack.Screen name="DrawText" component={DrawText} />
      <Stack.Screen name="ThemeLayer" component={ThemeLayer} />
      <Stack.Screen name="ObjectEdit" component={ObjectEdit} />
      <Stack.Screen name="DataImport" component={DataImport} />
    </Stack.Navigator>
  );
}
