import { TurboModule } from "@rnoh/react-native-openharmony";
import { TM } from "@rnoh/react-native-openharmony/generated";
import { stream  } from '@kit.ArkTS';

import abilityAccessCtrl, { Permissions } from '@ohos.abilityAccessCtrl';
// import  { fileIo, picker } from '@kit.CoreFileKit';
import { common } from '@kit.AbilityKit';
import { BusinessError } from '@kit.BasicServicesKit';
import { buffer, util } from "@kit.ArkTS";
import fileShare from '@ohos.fileshare';
import { Environment, fileUri, picker } from '@kit.CoreFileKit';
import fs from '@ohos.file.fs';

export class HTools extends TurboModule implements TM.RTNHTools.Spec {

  /**
   * 校验当前是否已经授权
   * @param permission 待判断的权限
   * @returns 已授权 true，未授权 false
   */
  async checkPermissions(permission: Permissions[]): Promise<boolean> {
    // 创建权限管理对象
    const atManager = abilityAccessCtrl.createAtManager();
    try {
      // 向用户请求权限
      const result = await atManager.requestPermissionsFromUser(getContext(), permission);
      // 检查所有权限是否都被授予
      return result.authResults.every(status => status === 0);
    } catch (err) {
      // 如果请求失败，抛出错误
      // throw new Error(`requestPermissionsFromUser failed: ${JSON.stringify(err)}`);
      return false;
    }
  }

  async openDoc(option?: picker.DocumentSelectOptions): Promise<Array<string>> {
    return new Promise(resolve => {

      const documentSelectOptions = new picker.DocumentSelectOptions();
      if (option?.maxSelectNumber) {
        // 选择文档的最大数目（可选）。
        documentSelectOptions.maxSelectNumber = option.maxSelectNumber;
      }
      if (option?.defaultFilePathUri) {
        // 指定选择的文件或者目录路径（可选）。
        documentSelectOptions.defaultFilePathUri = option.defaultFilePathUri;
      }
      if (option?.fileSuffixFilters) {
        // 选择文件的后缀类型['后缀类型描述|后缀类型']（可选，不传该参数，默认不过滤，即显示所有文件），若选择项存在多个后缀名，则每一个后缀名之间用英文逗号进行分隔（可选），后缀类型名不能超过100。此外2in1设备支持通过通配符方式['所有文件(*.*)|.*']，表示为显示所有文件，手机暂不支持该配置。
        // eg: ['图片(.png, .jpg)|.png,.jpg', '文档|.txt', '视频|.mp4', '.pdf'];
        documentSelectOptions.fileSuffixFilters = option?.fileSuffixFilters;
      }
      if (option?.multiAuthMode != undefined) {
        //批量授权模式，默认为false（非批量授权模式）。当multAuthMode为true时为批量授权模式。当multAuthMode为true时，只有multiUriArray参数生效，其他参数不生效。仅支持手机设备。
        documentSelectOptions.multiAuthMode = false;
      }
      if (option?.multiUriArray != undefined) {
        //需要传入批量授权的uri数组（仅支持文件，文件夹不生效）。配合multAuthMode使用。当multAuthMode为false时，配置该参数不生效。仅支持手机设备。
        documentSelectOptions.multiUriArray = option?.multiUriArray;
      }
      if (option?.mergeMode != undefined) {
        //开启聚合视图模式，支持拉起文件管理应用的聚合视图。默认为DEFAULT，表示该参数不生效，非聚合视图。当该参数置为非DEFAULT时，其他参数不生效。仅支持手机设备。
        documentSelectOptions.mergeMode = option?.mergeMode;
      }

      let uris: Array<string> = [];
      let context = getContext(this) as common.Context; // 请确保 getContext(this) 返回结果为 UIAbilityContext
      // 创建文件选择器实例
      const documentViewPicker = new picker.DocumentViewPicker(context);
      documentViewPicker.select(documentSelectOptions).then((documentSelectResult: Array<string>) => {
        //文件选择成功后，返回被选中文档的URI结果集。
        uris = documentSelectResult;
        console.info('documentViewPicker.select to file succeed and uris are:' + uris);

        resolve(uris);
      }).catch((err: BusinessError) => {
        console.error(`Invoke documentViewPicker.select failed, code is ${err.code}, message is ${err.message}`);
        resolve([]);
      })
    })
  }


  async openDocSave(option?: picker.DocumentSaveOptions): Promise<Array<string>> {
    return new Promise(resolve => {

      const documentSaveOptions = new picker.DocumentSaveOptions();
      if (option?.newFileNames) {
        // 拉起documentPicker进行保存的文件名，若无此参数，则默认需要用户自行输入
        documentSaveOptions.newFileNames = option.newFileNames;
      }
      if (option?.defaultFilePathUri) {
        // 指定保存的文件或者目录路径
        documentSaveOptions.defaultFilePathUri = option.defaultFilePathUri;
      }
      if (option?.fileSuffixChoices) {
        // 保存文件的后缀类型
        documentSaveOptions.fileSuffixChoices = option?.fileSuffixChoices;
      }

      let uris: Array<string> = [];
      let context = getContext(this) as common.Context; // 请确保 getContext(this) 返回结果为 UIAbilityContext
      // 创建文件选择器实例
      const documentViewPicker = new picker.DocumentViewPicker(context);
      documentViewPicker.save(documentSaveOptions).then((documentSaveResult: Array<string>) => {
        //文件选择成功后，返回被选中文档的URI结果集。
        uris = documentSaveResult;
        console.info('documentViewPicker.select to file succeed and uris are:' + uris);

        resolve(uris);
      }).catch((err: BusinessError) => {
        console.error(`Invoke documentViewPicker.select failed, code is ${err.code}, message is ${err.message}`);
        resolve([]);
      })
    })
  }
  async readFile(path: string, encoding?: string): Promise<string> {
    return new Promise(resolve => {
      try {
        let file = fs.openSync(path, fs.OpenMode.READ_ONLY);
        let bufferSize = 1024;
        let arrayBuffer = new ArrayBuffer(bufferSize);

        class Option {
          public offset: number = 0;
          public length: number = bufferSize;
        }

        let option = new Option();
        let content: string = "";
        let allBuffer = buffer.concat([]);
        let readLen: number = 0;
        do {
          // 读取文件内容到数组缓冲区
          readLen = fs.readSync(file.fd, arrayBuffer, option);
          if (readLen > 0) {
            const buf = buffer.from(arrayBuffer, 0, readLen);
            allBuffer = buffer.concat([allBuffer, buf])
            // 更新下一次读取的偏移量，继续从文件后续位置读取
            option.offset += readLen;
          }
        } while (readLen === bufferSize);
        fs.close(file);
        content = allBuffer.toString(encoding || 'utf8')
        resolve(content);
      } catch (e) {
        resolve('');
      }
    });
  }

  async writeFile(filePath: string,value:string): Promise<boolean> {
    return new Promise(resolve => {
      try {
        let file = fs.openSync(filePath, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE);
        let str: string = value;
        fs.write(file.fd, str).then((writeLen: number) => {
          console.info("write data to file succeed and size is:" + writeLen);
          resolve(true);
        }).catch((err: BusinessError) => {
          console.error("write data to file failed with error message: " + err.message + ", error code: " + err.code);
          resolve(false);
        }).finally(() => {
          fs.closeSync(file);
        });

      } catch (e) {
        resolve(false);
      }
    });
  }


  async copyDir(path: string, dest: string): Promise<boolean> {

    return new Promise(resolve => {
      try {
        let srcDirPathLocal: string = path;
        let dstDirPathLocal: string = dest;

        let srcDirUriLocal: string = path;
        let dstDirUriLocal: string = dest;
        if(srcDirUriLocal.indexOf('file:') == -1)
          srcDirUriLocal = fileUri.getUriFromPath(srcDirPathLocal);
        if(dstDirUriLocal.indexOf('file:') == -1)
          dstDirUriLocal = fileUri.getUriFromPath(dstDirPathLocal);
        fs.copy(srcDirUriLocal, dstDirUriLocal, (err: BusinessError) => {
          if (err) {
            console.error(`Failed to copy: ${JSON.stringify(err)}`);
            resolve(false);
            return;
          }
          resolve(true);
          console.info("Succeeded in copying. ");
        })
      } catch (e) {
        resolve(false);
      }
    });
  }
 
}
