import React, { Component } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
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

function SubmitBtm({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>SUBMIT</Text>
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
        <View>
          <Ionicons name="md-happy" size={100} />
          <Text>You already logged your information for today.</Text>
          <TextButton onPress={this.reset}>Reset</TextButton>
        </View>
      )
    }

    return (
      <View>
        <DateHeader date={new Date().toLocaleDateString()} />
        {Object.keys(metaInfo).map(key => {
          const { getIcon, type, ...rest } = metaInfo[key]
          const value = this.state[key]

          return (
            <View key={key}>
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
        <Text>123</Text>
      </View>
    )
  }
}

function mapStateToProps(state) {
  const key = timeToString()
  return {
    // undefined 不是 'undefined'
    alreadyLogged: state[key] && state[key].today === undefined
  }
}

export default connect(mapStateToProps)(AddEntry)
