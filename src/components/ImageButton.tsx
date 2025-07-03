import { Image, ImageSourcePropType, ImageStyle, StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native'

export default function ImageButton(props: {
  image?: ImageSourcePropType
  title?: string
  onPress: () => void
  style?: StyleProp<ViewStyle>
  imageStyle?: StyleProp<ImageStyle>
  textStyle?: StyleProp<TextStyle>
}) {
  return (
    <TouchableOpacity
      style={[styles.methodBtn, props.style]}
      activeOpacity={0.8}
      onPress={() => props.onPress()}
    >
      {
        props.image && <Image source={props.image} style={[styles.methodBtnImg, props.imageStyle]} />
      }
      {
        props.title && <Text style={[styles.methodBtnTxt, props.textStyle]}>{props.title}</Text>
      }
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  methodBtn: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40,
    borderRadius: 4,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  methodBtnImg: {
    height: 24,
    width: 24,
  },
  methodBtnTxt: {
    fontSize: 10,
    marginTop: 4,
  },
});