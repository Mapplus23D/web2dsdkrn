import Toast from 'react-native-easy-toast'
import { LoadingRefProps } from 'src/components/Loading'

let Loading: React.RefObject<LoadingRefProps> | null | undefined = undefined

const setLoading = (ref?: React.RefObject<LoadingRefProps>) => {
  Loading = ref
}

const getLoading = () => {
  return Loading?.current
}


let toast: React.RefObject<Toast> | null | undefined = undefined

const setToast = (ref?: React.RefObject<Toast>) => {
  toast = ref
}

const getToast = () => {
  return toast?.current
}


export default {
  setLoading,
  getLoading,
  setToast,
  getToast,
}