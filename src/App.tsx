import { NavigationContainer } from "@react-navigation/native";
import { LogBox } from 'react-native';
import DemoStack from "./navigators/DemoStack";

if (!__DEV__) {
  LogBox.ignoreAllLogs();
}

export default function App() {

  return (
    <NavigationContainer>
      <DemoStack />
    </NavigationContainer>
  )
}