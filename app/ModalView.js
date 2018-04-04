/**
 * 作者：请叫我百米冲刺 on 2018/4/3 下午4:24
 * 邮箱：mail@hezhilin.cc
 *
 * 因为ios端同时只能存在一个 Modal，并且显示第三个 Modal 界面的时候有奇怪的 bug
 *
 * 为了兼容 ios 的使用，这里需要封装一个 ModalView
 *
 * Android 依旧使用 React Native Modal 来进行实现
 * ios 的话采用 RootSiblings 配合进行使用
 *
 * 同时采用与 React Native Modal 相同的API
 */
'use strict';
import React, {Component} from "react";
import {Modal, Animated, Platform, Easing, StyleSheet, Dimensions} from "react-native";
import RootSiblings from 'react-native-root-siblings';

const {height} = Dimensions.get('window')
var isAndroid = Platform.OS == 'android'

export default class ModalView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            visible: false, //给android式的modal进行使用的
            animationSlide: new Animated.Value(0),
            animationFade: new Animated.Value(0)
        };
        //ios也可以指定使用android的实现方式
        if (this.props.useAndroid) {
            isAndroid = true
        }
    }

    render() {
        this.RootSiblings && this.RootSiblings.update(this.renderIos())
        return isAndroid ? this.renderAndroid() : null
    }

    renderAndroid = () => {
        return (
            <Modal {...this.props}
                   transparent={true}
                   visible={this.state.visible}
                   onRequestClose={() => {
                       if (this.props.onRequestClose) {
                           this.props.onRequestClose()
                       } else {
                           this.disMiss()
                       }
                   }}>
                {this.props.children}
            </Modal>
        )
    }

    renderIos = () => {
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

    show = (callback) => {
        if (this.isShow()) {
            return
        }
        if (isAndroid) {
            this.setState({visible: true}, () => callback && callback())
        } else {
            this.RootSiblings = new RootSiblings(this.renderIos(), () => {
                if (this.props.animationType == 'fade') {
                    this.animationFadeIn(callback)
                } else if (this.props.animationType == 'slide') {
                    this.animationSlideIn(callback)
                } else {
                    this.animationNoneIn(callback)
                }
            });
        }
    }

    disMiss = (callback) => {
        if (!this.isShow()) {
            return
        }
        if (isAndroid) {
            this.setState({visible: false}, () => callback && callback())
        } else {
            if (this.props.animationType == 'fade') {
                this.animationFadeOut(callback)
            } else if (this.props.animationType == 'slide') {
                this.animationSlideOut(callback)
            } else {
                this.animationNoneOut(callback)
            }
        }
    }

    isShow = () => {
        if (isAndroid) {
            return this.state.visible
        } else {
            return this.RootSiblings ? true : false
        }
    }

    animationNoneIn = (callback) => {
        this.state.animationSlide.setValue(1)
        this.state.animationFade.setValue(1)
        callback && callback()
    }

    animationNoneOut = (callback) => {
        this.animationCallback(callback);
    }

    animationSlideIn = (callback) => {
        this.setState({visible: true}, () => {
            this.state.animationSlide.setValue(0)
            this.state.animationFade.setValue(1)
            Animated.timing(this.state.animationSlide, {
                easing: Easing.linear(),
                duration: 300,
                toValue: 1,
            }).start(() => callback && callback());
        })
    }

    animationSlideOut = (callback) => {
        this.state.animationSlide.setValue(1)
        this.state.animationFade.setValue(1)
        Animated.timing(this.state.animationSlide, {
            easing: Easing.linear(),
            duration: 300,
            toValue: 0,
        }).start(() => this.animationCallback(callback));
    }

    animationFadeIn = (callback) => {
        this.setState({visible: true}, () => {
            this.state.animationSlide.setValue(1)
            this.state.animationFade.setValue(0)
            Animated.timing(this.state.animationFade, {
                easing: Easing.linear(),
                duration: 300,
                toValue: 1,
            }).start(() => callback && callback());
        })
    }

    animationFadeOut = (callback) => {
        this.state.animationSlide.setValue(1)
        this.state.animationFade.setValue(1)
        Animated.timing(this.state.animationFade, {
            easing: Easing.linear(),
            duration: 300,
            toValue: 0,
        }).start(() => this.animationCallback(callback));
    }

    animationCallback = (callback) => {
        this.RootSiblings && this.RootSiblings.destroy(() => {
            callback && callback()
            this.RootSiblings = undefined
        })
    }
}

const styles = StyleSheet.create({
    root: {
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
    }
})