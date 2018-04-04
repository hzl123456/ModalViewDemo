/**
 * 作者：请叫我百米冲刺 on 2018/4/4 下午1:24
 * 邮箱：mail@hezhilin.cc
 */
'use strict';
import React, {Component} from "react";
import {View, Dimensions, Platform, Button} from "react-native";
import ModalOne from './ModalOne'
import ModalTwo from './ModalTwo'
import ModalThree from './ModalThree'

const {width} = Dimensions.get('window')

export default class Main extends Component {

    constructor(props) {
        super(props)
        console.disableYellowBox = true;
    }

    render() {
        return (
            <View style={{flex: 1, width: width, paddingTop: Platform.OS == 'android' ? 0 : 20}}>

                <Button title="打开ModalOne" onPress={() => this.onPressModal(1)}/>

                <Button title="打开ModalTwo" onPress={() => this.onPressModal(2)}/>

                <Button title="打开ModalThree" onPress={() => this.onPressModal(3)}/>

                <View style={{width: width, height: 100}}>
                    <ModalOne ref={(c) => this.modalOne = c}/>

                    <ModalTwo ref={(c) => this.modalTwo = c} callback={() => this.onPressModal(3)}/>

                    <ModalThree ref={(c) => this.modalThree = c}/>
                </View>
            </View>
        )
    }

    onPressModal = (type) => {
        if (type == 1) {
            this.modalOne && this.modalOne.show()

        } else if (type == 2) {
            this.modalTwo && this.modalTwo.show()

        } else if (type == 3) {
            this.modalThree && this.modalThree.show()
        }
    }
}
