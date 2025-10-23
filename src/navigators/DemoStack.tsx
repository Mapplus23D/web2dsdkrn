/*
 * @Author: xiezhiyan 16297996+xiezhiyan@users.noreply.github.com
 * @Date: 2025-07-09 16:52:25
 * @LastEditors: xiezhiyan 16297996+xiezhiyan@users.noreply.github.com
 * @LastEditTime: 2025-10-09 15:01:58
 * @FilePath: /web2dsdkrn/src/navigators/DemoStack.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createStackNavigator } from '@react-navigation/stack';
import BaseMap from '../demos/1_basemap/1_1_BaseMap';
import DataImport from '../demos/2_mapobject/2_1_DataImport';
import MapOpenSave from '../demos/2_mapobject/2_2_MapOpenSave';
import DrawObject from '../demos/2_mapobject/2_3_DrawObject';
import DrawText from '../demos/2_mapobject/2_4_DrawText';
import ObjectEdit from '../demos/2_mapobject/2_5_ObjectEdit';
import ObjectAttribute from '../demos/2_mapobject/2_6_ObjectAttribute';
import LayerStyle from '../demos/2_mapobject/2_7_LayerStyle';
import ThemeLayer from '../demos/2_mapobject/2_8_ThemeLayer';
import Measure from '../demos/3_maputils/3_1_Measure';
import Analyst from '../demos/3_maputils/3_2_Analyst';
import MapCallout from '../demos/3_maputils/3_3_MapCallout';
import Navigation from '../demos/3_maputils/3_4_Navigation';
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
      <Stack.Screen name="LayerStyle" component={LayerStyle} />
      <Stack.Screen name="Measure" component={Measure} />
      <Stack.Screen name="ObjectAttribute" component={ObjectAttribute} />
      <Stack.Screen name="MapOpenSave" component={MapOpenSave} />
      <Stack.Screen name="Analyst" component={Analyst} />
      <Stack.Screen name="MapCallout" component={MapCallout} />
      <Stack.Screen name="Navigation" component={Navigation} />
    </Stack.Navigator>
  );
}
