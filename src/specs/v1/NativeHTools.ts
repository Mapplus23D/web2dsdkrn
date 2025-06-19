import { TurboModule, TurboModuleRegistry } from 'react-native';

export enum MergeTypeMode {
  /**
   * Indicates common mode.
   *
   * @syscap SystemCapability.FileManagement.UserFileService
   * @atomicservice
   * @since 15
   */
  DEFAULT = 0,
  /**
   * Indicates that audios are allowed to be selected
   *
   * @syscap SystemCapability.FileManagement.UserFileService
   * @atomicservice
   * @since 15
   */
  AUDIO = 1,
  /**
   * Indicates that videos are allowed to be selected
   *
   * @syscap SystemCapability.FileManagement.UserFileService
   * @atomicservice
   * @since 15
   */
  VIDEO = 2,
  /**
   * Indicates that documents are allowed to be selected
   *
   * @syscap SystemCapability.FileManagement.UserFileService
   * @atomicservice
   * @since 15
   */
  DOCUMENT = 3,
  /**
   * Indicates that pictures are allowed to be selected
   *
   * @syscap SystemCapability.FileManagement.UserFileService
   * @atomicservice
   * @since 15
   */
  PICTURE = 4
}

export type DocumentSelectOptions = {
  /**
   * 选择文档的最大数目（可选）。
   * @default 1
   */
  maxSelectNumber?: number;
  /**
   * 指定选择的文件或者目录路径（可选）。
   * @default "file://docs/storage/Users/currentUser/test"
   */
  defaultFilePathUri?: string;
  /**
   * 选择文件的后缀类型['后缀类型描述|后缀类型']（可选，不传该参数，默认不过滤，即显示所有文件），若选择项存在多个后缀名，则每一个后缀名之间用英文逗号进行分隔（可选），后缀类型名不能超过100。此外2in1设备支持通过通配符方式['所有文件(*.*)|.*']，表示为显示所有文件，手机暂不支持该配置。
   * @default []
   */
  fileSuffixFilters?: string[];
  /**
   * 选择是否对指定文件或目录授权，true为授权，当为true时，defaultFilePathUri为必选参数，拉起文管授权界面；false为非授权（默认为false），拉起常规文管界面（可选），仅支持2in1设备。
   * @default false
   */
  authMode?: boolean;
  /**
   * 批量授权模式，默认为false（非批量授权模式）。当multAuthMode为true时为批量授权模式。当multAuthMode为true时，只有multiUriArray参数生效，其他参数不生效。仅支持手机设备。
   * @default false
   */
  multAuthMode?: boolean;
  /**
   * 需要传入批量授权的uri数组（仅支持文件，文件夹不生效）。配合multAuthMode使用。当multAuthMode为false时，配置该参数不生效。仅支持手机设备。
   * @default []
   */
  multiUriArray?: string[];
  /**
   * 开启聚合视图模式，支持拉起文件管理应用的聚合视图。默认为DEFAULT，表示该参数不生效，非聚合视图。当该参数置为非DEFAULT时，其他参数不生效。仅支持手机设备。
   * @default MergeTypeMode.DEFAULT
   */
  mergeMode?: MergeTypeMode;
}


export type DocumentSaveOptions = {

  /**
   * 指定选择的文件或者目录路径（可选）。
   * @default "file://docs/storage/Users/currentUser/test"
   */
  defaultFilePathUri?: string;
  /**
  *拉起documentPicker进行保存的文件名，若无此参数，则默认需要用户自行输入]
   */
  newFileNames?: string[];

  /**
   * 保存文件的后缀类型
   * @default []
   */
  fileSuffixChoices?: string[];

}

export interface Spec extends TurboModule {

  /**
   * 校验当前是否已经授权
   * @param permission 待判断的权限
   * @returns 已授权 true，未授权 false
   */
  checkPermissions(permission: string[]): Promise<boolean>

  openDoc(options?: DocumentSelectOptions): Promise<Array<string>>

  openDocSave(options?: DocumentSaveOptions): Promise<Array<string>>

  readFile(path: string, encoding?: string): Promise<string>

  writeFile(filepath: string, value: string): Promise<boolean>

  copyDir(path: string, dest: string): Promise<boolean>
}

export default TurboModuleRegistry.get<Spec>(
  'RTNHTools',
) as Spec | null;
