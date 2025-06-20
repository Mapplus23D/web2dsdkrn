import { NavigationContainer } from "@react-navigation/native";
import { useEffect, useRef } from 'react';
import { LogBox } from 'react-native';
import Toast from 'react-native-easy-toast';
import { Loading } from './components';
import { LoadingRefProps } from './components/Loading';
import DemoStack from "./navigators/DemoStack";
import { ToolRefs } from './utils';

if (!__DEV__) {
  LogBox.ignoreAllLogs();
}

export default function App() {

  const loadingRef = useRef<LoadingRefProps | null>(null)
  const toastRef = useRef<Toast | null>(null)

  useEffect(() => {
    ToolRefs.setLoading(loadingRef);
    ToolRefs.setToast(toastRef);
    return () => {
      toastRef
      ToolRefs.setLoading(undefined);
      ToolRefs.setToast(undefined);
    }
  }, []);

  return (
    <>
      <NavigationContainer>
        <DemoStack />
      </NavigationContainer>
      <Loading ref={loadingRef} displayMode={'normal'} />
      <Toast
        ref={toastRef}
        position={'top'}
        positionValue={40}
      />
    </>
  )
}