import React, { Component } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet
} from 'react-native'
import {
  getMetricMetaInfo,
  timeToString,
  getDailyReminderValue
} from '../utils/helpers'
import UdaciSlider from './UdaciSlider'
import UdaciSteppers from './UdaciSteppers'
import DateHeader from './DateHeader'
import { Ionicons } from '@expo/vector-icons'
import TextButton from './TextButton'
import { submitItem, removeItem } from '../utils/api'
import { connect } from 'react-redux'
import { addEntry } from '../actions'
import { white, purple } from '../utils/colors'

function SubmitBtm({ onPress }) {
  return (
    <TouchableOpacity
      style={
        Platform.OS === 'ios' ? styles.iosSubmitBtn : styles.androidSubmitBtn
      }
      onPress={onPress}
    >
      <Text style={styles.submitBtnText}>SUBMIT</Text>
    </TouchableOpacity>
  )
}

class AddEntry extends Component {
  state = {
    run: 0,
    bike: 0,
    swim: 0,
    sleep: 0,
    eat: 0
  }

  increment = metric => {
    const { max, step } = getMetricMetaInfo(metric)

    this.setState(state => {
      const count = state[metric] + step

      return {
        ...state,
        [metric]: count > max ? max : count
      }
    })
  }

  decrement = metric => {
    this.setState(state => {
      const count = state[metric] - getMetricMetaInfo(metric).step

      return {
        // 这里和下面的那样的返回有是区别呢？性能？
        ...state,
        [metric]: count < 0 ? 0 : count
      }
    })
  }

  slide = (metric, value) => {
    this.setState(() => ({
      [metric]: value
    }))
  }

  submit = () => {
    const key = timeToString()
    const entry = this.state

    // Update Redux
    this.props.dispatch(
      addEntry({
        [key]: entry
      })
    )

    this.setState(() => ({
      run: 0,
      bike: 0,
      swim: 0,
      sleep: 0,
      eat: 0
    }))

    // Navigate to home

    // Save to 'DB'
    submitItem(key, entry)

    // Clear local notification
  }

  reset = () => {
    const key = timeToString()

    // Update Redux
    this.props.dispatch(
      addEntry({
        [key]: getDailyReminderValue()
      })
    )

    // Route to Homen

    // Update "DB"
    removeItem(key)
  }

  render() {
    const metaInfo = getMetricMetaInfo()
    console.log(this.props.alreadyLogged)
    // 这里非常好，因为 render() 其实就是一个函数，只要遇到 return 它就返回并不会再执行后面的代码
    if (this.props.alreadyLogged) {
      return (
        <View style={styles.center}>
          <Ionicons name={Platform.OS === 'ios' ? 'ios-happy-outline' : 'md-happy'} size={100} />
          <Text>You already logged your information for today.</Text>
          <TextButton onPress={this.reset} style={{padding: 10}}>Reset</TextButton>
        </View>
      )
    }

    return (
      <View style={styles.container}>
        <DateHeader date={new Date().toLocaleDateString()} />
        {Object.keys(metaInfo).map(key => {
          const { getIcon, type, ...rest } = metaInfo[key]
          const value = this.state[key]

          return (
            <View key={key} style={styles.row}>
              {getIcon()}
              {type === 'slider' ? (
                <UdaciSlider
                  value={value}
                  onChange={value => this.slide(key, value)}
                  {...rest}
                />
              ) : (
                <UdaciSteppers
                  value={value}
                  onIncrement={() => this.increment(key)}
                  onDecrement={() => this.decrement(key)}
                  {...rest}
                />
              )}
            </View>
          )
        })}
        <SubmitBtm onPress={this.submit} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: white
  },
  row :{
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  iosSubmitBtn: {
    backgroundColor: purple,
    padding: 10,
    borderRadius: 7,
    height: 45,
    marginLeft: 40,
    marginRight: 40
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
  },
  submitBtnText: {
    color: white,
    fontSize: 22,
    textAlign: 'center'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 30,
    marginLeft: 30
  }
})

function mapStateToProps(state) {
  const key = timeToString()
  return {
    // undefined 不是 'undefined'
    alreadyLogged: state[key] && state[key].today === undefined
  }
}

export default connect(mapStateToProps)(AddEntry)
