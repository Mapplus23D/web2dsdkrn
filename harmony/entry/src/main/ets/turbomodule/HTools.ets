import { TurboModule } from "@rnoh/react-native-openharmony";
import { TM } from "@rnoh/react-native-openharmony/generated";

import abilityAccessCtrl, { Permissions } from '@ohos.abilityAccessCtrl';
import { common } from '@kit.AbilityKit';
import { BusinessError, zlib } from '@kit.BasicServicesKit';
import { buffer } from "@kit.ArkTS";
import { fileUri, picker } from '@kit.CoreFileKit';
import fs from '@ohos.file.fs';
import { textToSpeech } from '@kit.CoreSpeechKit'
// import { BusinessError } from '@ohos.base'


export class HTools extends TurboModule implements TM.RTNHTools.Spec {
  private  _tts: textToSpeech.TextToSpeechEngine | null = null
  async initTTS(): Promise<boolean>{
    return new Promise(resolve => {
      try {
        const params: textToSpeech.CreateEngineParams = {
          language: 'zh-CN',  // 设置语言为中文
          person: 0,          // 设置发音人（0为默认发音人）
          online: 1           // 设置为在线模式（1为在线，0为离线）
        }

        textToSpeech.createEngine(params, (err: BusinessError, engine: textToSpeech.TextToSpeechEngine) => {
          if (err || !engine) {
            console.log('error',err)
            return
          }
          this._tts = engine
          this._tts.setListener({
            onStart: (reqId) => console.log(`开始合成: ${reqId}`),
            onError: (reqId, code) => console.error(`错误码: ${code}`),
            onComplete: () => console.log('合成结束'),
            onStop: (requestId: string, response: textToSpeech.StopResponse): void => {
              // throw new Error("Function not implemented.");
            }
          });
        })


        resolve(true);
      } catch (e) {
        resolve(false);
      }
    });
  }
  async speak(text: string): Promise<void>{

    if (!this._tts) {
      console.log('TTS未就绪')
      return
    }

    const speakParams: textToSpeech.SpeakParams = {
      requestId: 'tts_' + Date.now()
    }
    try {
      // this._tts.stop()
      if(text.indexOf('注意') !== -1 ){
        this._tts.stop()
      }else{
        if(this._tts.isBusy())
          return
      }

      this._tts.speak(text, speakParams)
    } catch (e) {
      console.log(`播报失败: ${JSON.stringify(e)}`)
    }
  }

  async stopSpeak(): Promise<void>{
    if (!this._tts) {
      console.log('TTS未就绪')
      return
    }
    try {
      this._tts.stop()
    } catch (e) {
      console.log(`停止失败: ${JSON.stringify(e)}`)
    }
  }
}
