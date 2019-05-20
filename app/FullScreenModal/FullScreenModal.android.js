/**
 * android 全屏展示的 Modal
 * @Author: linhe
 * @Date: 2019-04-08 15:17
 */
import React, {Component} from 'react';
import {requireNativeComponent, View} from 'react-native';
import PropTypes from 'prop-types';

const FullScreenModal = requireNativeComponent('RCTFullScreenModalHostView', null);

export default class FullScreenModalViewAndroid extends Component {
  _shouldSetResponder = () => {
    return true;
  }

  static propTypes = {
    isDarkMode: PropTypes.bool, // false 表示白底黑字，true 表示黑底白字
    autoKeyboard: PropTypes.bool, // 未知原因的坑，modal中的edittext自动弹起键盘要设置这个参数为true
  };

  render() {
    if (this.props.visible === false) {
      return null;
    }
    const containerStyles = {
      backgroundColor: this.props.transparent ? 'transparent' : 'white',
    };
    return (
      <FullScreenModal
        style={{position: 'absolute'}} {...this.props}
        onStartShouldSetResponder={this._shouldSetResponder}
        onFullScreenShow={() => this.props.onShow && this.props.onShow()}
        onFullScreenRequstClose={() => this.props.onRequestClose && this.props.onRequestClose()}>
        <View style={[{position: 'absolute', left: 0, top: 0}, containerStyles]}>
          {this.props.children}
        </View>
      </FullScreenModal>
    );
  }
}
