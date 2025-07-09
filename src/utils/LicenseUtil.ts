import { RTNWebMap } from '@mapplus/react-native-webmap'

export const active = async (code?: string) => {
  let license = await RTNWebMap?.getLicenseInfo()
  if (!license) {
    // 激活序列号，替换为有效的序列号
    const serial = code || 'VEJZU-QQY5C-7YQ2G-RQ2CS-M6RTH'
    const result = await RTNWebMap?.activate(serial)
    if (result.success) {
      license = await RTNWebMap?.getLicenseInfo()
    } else {
      console.warn(result.message)
    }
  }
  if (!license?.isValid) {
    console.warn(license ? license.message : '没有获取到许可')
  }
  return license
}

export const getLicenseInfo = async () => {
  return await RTNWebMap?.getLicenseInfo()
}
