/**
 * 自定义原生接口
 *
 * 1. 在src/specs/v1/ 中创建接口文件
 * 2. 使用npm run codegen在鸿蒙原生工程中生成对应文件
 * 3. 在原生工程中实现接口功能
 */
import { TurboModule, TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  initTTS(): Promise<boolean>;

  speak(text: string): Promise<void>;

  stopSpeak(): Promise<void>;
}

export default TurboModuleRegistry.get<Spec>('RTNHTools') as Spec;
