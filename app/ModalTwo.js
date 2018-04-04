/**
 * 作者：请叫我百米冲刺 on 2018/4/4 下午1:24
 * 邮箱：mail@hezhilin.cc
 */
'use strict';
import React, {Component} from "react";
import {View, Text, Dimensions, Button} from "react-native";
import ModalView from './ModalView'
const {width} = Dimensions.get('window')

export default class ModalTwo extends Component {

    render() {
        return (
            <ModalView ref={(c) => this.modalView = c} animationType="fade">
                <View style={{flex: 1, width: width, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center'}}>
                    <View style={{width: width, backgroundColor: 'white'}}>
                        <Text style={{padding: 10}}>这里是ModalTwo,动画类型为fade</Text>
                        <Button title="关闭ModalTwo" onPress={() => this.disMiss()}/>
                        <Button title="打开ModalThree" onPress={() => this.props.callback && this.props.callback()}/>
                    </View>
                </View>
            </ModalView>
        )
    }

    show = () => {
        this.modalView && this.modalView.show()
    }

    disMiss = () => {
        this.modalView && this.modalView.disMiss()
    }
}
