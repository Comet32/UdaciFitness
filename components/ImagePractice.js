import React, { Component } from 'react'
import {
  Text,
  View,
  StyleSheet,
  ImageEditor,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native'
import { ImagePicker } from 'expo'
import { purple, white } from '../utils/colors'

export default class ImagePractice extends Component {
  state = {
    image: null,
    hasTextPiker: true
  }

  pickImage = () => {
    ImagePicker.launchImageLibraryAsync({
      allowEditing: true,
      aspect: [2, 1]
    }).then(result => {
      if (result.cancelled) {
        return
      }

      ImageEditor.cropImage(
        result.uri,
        {
          offset: { x: 0, y: 0 },
          size: { width: result.width, height: result.height },
          displaySize: { width: result.width, height: result.height },
          resizeMode: 'contain'
        },
        uri => this.setState(() => ({ image: uri, hasTextPiker: false })),
        () => console.log('Error')
      )
    })
  }

  render() {
    const { image, hasTextPiker } = this.state
    const { width, height } = Dimensions.get('window')

    return (
      <View style={styles.container}>
        {hasTextPiker && (
          <TouchableOpacity
            style={styles.androidSubmitBtn}
            onPress={this.pickImage}
          >
            <Text style={{ fontSize: 20, color: white }}>
              Open camera Roll
            </Text>
          </TouchableOpacity>
        )}

        {image && (
          <TouchableOpacity onPress={this.pickImage}>
            <Image
              style={[styles.img, { width, height }]}
              source={{ uri: image }}
            />
          </TouchableOpacity>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  img: {
    resizeMode: 'contain',
    backgroundColor: 'black'
  },
  androidSubmitBtn: {
    backgroundColor: purple,
    // 这里的 padding 值似乎只能是 number，因此无法传入两个值，因此需要在后面再设置 paddingLeft 和 paddingRight
    padding: 10,
    paddingLeft: 30,
    paddingRight: 30,
    height: 45,
    borderRadius: 2,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center'
  }
})
