/**
 * @Author: linhe
 * @Date: 2019-05-12 10:11
 *
 * 因为ios端同时只能存在一个Modal，并且Modal多次显示隐藏会有很奇怪的bug
 *
 * 为了兼容ios的使用，这里需要封装一个ModalView
 *
 * Android 依旧使用 React Native Modal 来进行实现
 * ios 的话采用 RootSiblings 配合进行使用
 *
 * 这个是因为有的modal里面还需要跳转到其他界面
 * 这个时候主要要将该View放到最外边的层级才可以
 *
 * modalType:1 //表示使用Modal进行实现
 *           2 //表示使用RootSiblings进行实现
 *           3 //表示使用View进行实现
 * 注意:默认情况下 Android 使用的是1，ios使用的是2
 *
 * 同时采用与 React Native Modal 相同的API
 */
'use strict';
import React, {Component} from "react";
import {Animated, BackHandler, Platform, Easing, StyleSheet, Dimensions, Modal} from "react-native";
import PropTypes from 'prop-types'
import RootSiblings from 'react-native-root-siblings';
import FullScreenModal from './FullScreenModal/FullScreenModal'

const {height} = Dimensions.get('window')
const animationShortTime = 250 //动画时长为250ms
const DEVICE_BACK_EVENT = 'hardwareBackPress';

export default class ModalView extends Component {

  static propTypes = {
    isDarkMode: PropTypes.bool, // false 表示白底黑字，true 表示黑底白字
    autoKeyboard: PropTypes.bool, // 未知原因的坑，modal中的edittext自动弹起键盘要设置这个参数为true
    useReactModal: PropTypes.bool, // 是否使用 RN Modal 进行实现
    modalType: PropTypes.number // modalType 类型，默认 android 为 1，ios 为 2
  };

  static defaultProps = {
    isDarkMode: false,
    autoKeyboard: false,
    useReactModal: false,
    modalType: (Platform.OS === 'android' ? 1 : 2) // 默认 android 为1，ios 为2
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      animationSlide: new Animated.Value(0),
      animationFade: new Animated.Value(0)
    };
  }

  render() {
    const {modalType} = this.props
    if (modalType === 1) { //modal实现
      return this._renderModal()
    } else if (modalType === 2) { //RootSiblings实现
      this.RootSiblings && this.RootSiblings.update(this._renderRootSiblings())
      return null
    } else { //View的实现
      return this._renderView()
    }
  }

  _renderModal = () => {
    const ModalView = this.props.useReactModal ? Modal : FullScreenModal
    return (
      <ModalView
        transparent={true}
        {...this.props}
        visible={this.state.visible}
        onRequestClose={() => {
          if (this.props.onRequestClose) {
            this.props.onRequestClose()
          } else {
            this.disMiss()
          }
        }}>
        {this.props.children}
      </ModalView>
    )
  }

  _renderRootSiblings = () => {
    return (
      <Animated.View style={[styles.root,
        {opacity: this.state.animationFade},
        {
          transform: [{
            translateY: this.state.animationSlide.interpolate({
              inputRange: [0, 1],
              outputRange: [height, 0]
            }),
          }]
        }]}>
        {this.props.children}
      </Animated.View>
    );
  }

  _renderView = () => {
    if (this.state.visible) {
      return (
        <Animated.View style={[styles.root,
          {opacity: this.state.animationFade},
          {
            transform: [{
              translateY: this.state.animationSlide.interpolate({
                inputRange: [0, 1],
                outputRange: [height, 0]
              }),
            }]
          }]}>
          {this.props.children}
        </Animated.View>
      );
    } else {
      return null
    }
  }

  show = (callback) => {
    if (this.isShow()) {
      return
    }
    const {modalType, animationType} = this.props
    if (modalType === 1) { //modal
      this.setState({visible: true}, () => callback && callback())
    } else if (modalType === 2) { //RootSiblings
      this.RootSiblings = new RootSiblings(this._renderRootSiblings(), () => {
        if (animationType === 'fade') {
          this._animationFadeIn(callback)
        } else if (animationType === 'slide') {
          this._animationSlideIn(callback)
        } else {
          this._animationNoneIn(callback)
        }
      });
      // 这里需要监听 back 键
      this._addHandleBack()
    } else { //view
      if (animationType === 'fade') {
        this.setState({visible: true}, () => this._animationFadeIn(callback))
      } else if (animationType === 'slide') {
        this.setState({visible: true}, () => this._animationSlideIn(callback))
      } else {
        this.setState({visible: true}, () => this._animationNoneIn(callback))
      }
      // 这里需要监听 back 键
      this._addHandleBack()
    }
  }

  disMiss = (callback) => {
    if (!this.isShow()) {
      return
    }
    const {modalType, animationType} = this.props
    if (modalType === 1) { //modal
      this.setState({visible: false}, () => callback && callback())
    } else { //RootSiblings和View
      if (animationType === 'fade') {
        this._animationFadeOut(callback)
      } else if (animationType === 'slide') {
        this._animationSlideOut(callback)
      } else {
        this._animationNoneOut(callback)
      }
      // 移除 back 键的监听
      this._removeHandleBack()
    }
  }

  isShow = () => {
    const {modalType} = this.props
    if (modalType === 1 || modalType === 3) { //modal和view
      return this.state.visible
    } else { //RootSiblings
      return !!this.RootSiblings
    }
  }

  _addHandleBack = () => {
    if (Platform.OS === 'ios') {
      return
    }
    // 监听back键
    this.handleBack = BackHandler.addEventListener(DEVICE_BACK_EVENT, () => {
      const {onRequestClose} = this.props
      if (onRequestClose) {
        onRequestClose()
      } else {
        this.disMiss()
      }
      return true
    });
  }

  _removeHandleBack = () => {
    if (Platform.OS === 'ios') {
      return
    }
    this.handleBack && this.handleBack.remove()
  }

  _animationNoneIn = (callback) => {
    this.state.animationSlide.setValue(1)
    this.state.animationFade.setValue(1)
    callback && callback()
  }

  _animationNoneOut = (callback) => {
    this._animationCallback(callback);
  }

  _animationSlideIn = (callback) => {
    this.state.animationSlide.setValue(0)
    this.state.animationFade.setValue(1)
    Animated.timing(this.state.animationSlide, {
      easing: Easing.in(),
      duration: animationShortTime,
      toValue: 1,
    }).start(() => callback && callback());
  }

  _animationSlideOut = (callback) => {
    this.state.animationSlide.setValue(1)
    this.state.animationFade.setValue(1)
    Animated.timing(this.state.animationSlide, {
      easing: Easing.in(),
      duration: animationShortTime,
      toValue: 0,
    }).start(() => this._animationCallback(callback));
  }

  _animationFadeIn = (callback) => {
    this.state.animationSlide.setValue(1)
    this.state.animationFade.setValue(0)
    Animated.timing(this.state.animationFade, {
      easing: Easing.in(),
      duration: animationShortTime,
      toValue: 1,
    }).start(() => callback && callback());
  }

  _animationFadeOut = (callback) => {
    this.state.animationSlide.setValue(1)
    this.state.animationFade.setValue(1)
    Animated.timing(this.state.animationFade, {
      easing: Easing.in(),
      duration: animationShortTime,
      toValue: 0,
    }).start(() => this._animationCallback(callback));
  }

  _animationCallback = (callback) => {
    if (this.props.modalType === 2) {//RootSiblings
      this.RootSiblings && this.RootSiblings.destroy(() => {
        callback && callback()
        this.RootSiblings = undefined
      })
    } else { //view
      this.setState({visible: false}, () => callback && callback())
    }
  }
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  }
});