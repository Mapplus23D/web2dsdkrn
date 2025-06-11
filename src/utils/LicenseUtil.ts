import { RTNWebMap } from '@mapplus/react-native-webmap'

export const active = async (code?: string) => {
  let license = await RTNWebMap?.getLicenseInfo()
  if (!license) {
    // 激活序列号，替换为有效的序列号
    const serial = code || 'TAF78-X52C8-CPDTY-4QHMV-VFX8W'
    const result = await RTNWebMap?.activate(serial)
    if (result) {
      license = await RTNWebMap?.getLicenseInfo()
    }
  }
  return license
}

export const getLicenseInfo = async () => {
  return await RTNWebMap?.getLicenseInfo()
}
