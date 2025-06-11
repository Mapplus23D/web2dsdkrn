import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export type DemoStackParamList = {
  DemoHome: undefined;

  DemoList: undefined;

  BaseMap: undefined;
  MapStyle: undefined;
  MapLocation: undefined;

  DrawObject: undefined;
  DrawText: undefined;
  DataImport: undefined;
  LayerStyle: undefined;
  ObjectEdit: undefined;
  ObjectAttribute: undefined;
  MapOpenSave: undefined;
};

export type DemoStackNavigationProps<
  RouteName extends keyof DemoStackParamList,
> = StackNavigationProp<DemoStackParamList, RouteName>;

export type DemoStackRouteProp<
  RouteName extends keyof DemoStackParamList,
> = RouteProp<DemoStackParamList, RouteName>

export interface DemoStackPageProps<RouteName extends keyof DemoStackParamList> {
  navigation: DemoStackNavigationProps<RouteName>
  route: DemoStackRouteProp<RouteName>
}