/**
 * 作者：请叫我百米冲刺 on 2018/4/4 下午1:24
 * 邮箱：mail@hezhilin.cc
 */
'use strict';
import React, {Component} from "react";
import {View, Text, Dimensions, Button} from "react-native";
import ModalView from './ModalView'
const {width} = Dimensions.get('window')

export default class ModalOne extends Component {

    render() {
        return (
            <ModalView ref={(c) => this.modalView = c} animationType="slide">
                <View style={{flex: 1, width: width, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center'}}>
                    <View style={{width: width, backgroundColor: 'white'}}>
                        <Text style={{padding: 10}}>这里是ModalOne,动画类型为slide</Text>
                        <Button title="关闭ModalOne" onPress={() => this.disMiss()}/>
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
