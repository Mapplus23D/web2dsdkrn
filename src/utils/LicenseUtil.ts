/*
 * @Author: xiezhiyan 16297996+xiezhiyan@users.noreply.github.com
 * @Date: 2025-07-11 15:46:31
 * @LastEditors: xiezhiyan 16297996+xiezhiyan@users.noreply.github.com
 * @LastEditTime: 2025-09-18 11:32:24
 * @FilePath: /web2dsdkrn/src/utils/LicenseUtil.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { RTNWebMap } from '@mapplus/react-native-webmap'
import ToolRefs from './ToolRefs'

export const active = async (code?: string) => {
  let license = await RTNWebMap?.getLicenseInfo()
  if (!license) {
    // 激活序列号，替换为有效的序列号
    const serial = code || 'MZQ34-E47KP-FQUFK-BB6P8-MM6F3'
    const result = await RTNWebMap?.activate(serial)
    if (result.success) {
      license = await RTNWebMap?.getLicenseInfo()
    } else {
      console.warn(result.message)
    }
  }
  if (!license?.isValid) {
    console.warn(license ? license.message : '没有获取到许可')
    ToolRefs.getToast()?.show(license ? license.message : '没有获取到许可')
  }
  return license
}

export const getLicenseInfo = async () => {
  return await RTNWebMap?.getLicenseInfo()
}
