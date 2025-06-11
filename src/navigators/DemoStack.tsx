import { createStackNavigator } from '@react-navigation/stack';
import BaseMap from '../demos/1_basemap/1_1_BaseMap';
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
    </Stack.Navigator>
  );
}
