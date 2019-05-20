import React, {Component} from 'react';
import {StyleSheet, Button, View, Text, Dimensions} from 'react-native';
import ModalView from './app/ModalView'

const {width} = Dimensions.get('window')

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      modalType: 1,
      useReactModal: false,
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={{lineHeight: 20}} onPress={() => this._onPressModal(1, true)}>RN 自带 Modal 实现</Text>
        <Text style={{lineHeight: 20}} onPress={() => this._onPressModal(1, false)}>全屏 Modal 实现</Text>
        <Text style={{lineHeight: 20}} onPress={() => this._onPressModal(2, false)}>RootSiblings Modal 实现</Text>
        <Text style={{lineHeight: 20}} onPress={() => this._onPressModal(3, false)}>View Modal 实现</Text>

        <ModalView
          ref={(c) => this.modalView = c}
          animationType={'slide'}
          onRequestClose={() => this._disMiss()}
          useReactModal={this.state.useReactModal}
          modalType={this.state.modalType}>
          <View style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center'}}>
            <Text onPress={() => this._disMiss()} style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}/>
            <View style={{alignItems: 'center', justifyContent: 'center', width: 300, height: 300, backgroundColor: 'white', borderRadius: 10}}>
              <Text style={{includeFontPadding: false, fontSize: 18, fontWeight: '600', color: 'blue'}}>欢迎打开 Modal</Text>
            </View>
          </View>
        </ModalView>
      </View>
    );
  }

  /**
   * @param modalType 弹窗类型
   * @param useReactModal android 是否使用 RN Modal 的实现
   * **/
  _onPressModal = (modalType, useReactModal = false) => {
    this.setState({modalType: modalType, useReactModal: useReactModal}, () => this._show())
  }

  _show = () => {
    this.modalView && this.modalView.show()
  }

  _disMiss = () => {
    this.modalView && this.modalView.disMiss()
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});
