import { RNPackageContext, RNPackage } from '@rnoh/react-native-openharmony/ts';
import { WebViewPackage } from '@react-native-oh-tpl/react-native-webview/ts';
import { SafeAreaViewPackage } from '@react-native-oh-tpl/react-native-safe-area-context';
import { WebMapPackage }  from '@mapplus/react-native-webmap/ts'

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
    new WebViewPackage(ctx),
    new SafeAreaViewPackage(ctx),
    new WebMapPackage(ctx),
  ];
}