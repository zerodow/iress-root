import React, { Component, useMemo } from 'react';
import {
    Button,
    Image,
    StyleSheet,
    Text,
    View,
    TouchableOpacity
} from 'react-native';
import TabStart from './TabStart'
import TabEnd from './TabEnd'
import TabMidle from './TabMidle'
class App extends Component {
    tabs = this.props.tabs;
    state = {
        activeTab: this.props.defaultActive || null
    };
    componentWillReceiveProps(next) {
        if (this.props.defaultActive !== next.defaultActive) {
            this.setState({ activeTab: next.defaultActive })
        }
    }
    render() {
        const { spaceWidth, onChangeTab, disableChangeTab } = this.props
        return (
            <View style={styles.app}>
                {this.tabs.map((el, index) => {
                    const isActive = el.key === this.state.activeTab;
                    if (index === 0) {
                        return (
                            <TouchableOpacity
                                disabled={!!disableChangeTab}
                                onPress={() => {
                                    this.setState({
                                        activeTab: el.key
                                    });
                                    onChangeTab(el)
                                }}
                            >
                                <TabStart tab={el} title={el.title} isActive={isActive} {...this.props} />
                            </TouchableOpacity>
                        );
                    }

                    if (index === this.tabs.length - 1) {
                        return (
                            <TouchableOpacity
                                disabled={!!disableChangeTab}
                                onPress={() => {
                                    this.setState({
                                        activeTab: el.key
                                    });
                                    onChangeTab(el)
                                }}
                            >
                                <TabEnd tab={el} tabLength={this.tabs.length} title={el.title} isActive={isActive} {...this.props} />
                            </TouchableOpacity>
                        );
                    }
                    if (
                        index > 1 &&
                        index < this.tabs.length - 2 &&
                        this.tabs.length >= 5
                    ) {
                        return (
                            <TouchableOpacity
                                disabled={!!disableChangeTab}
                                onPress={() => {
                                    this.setState({
                                        activeTab: el.key
                                    });
                                    onChangeTab(el)
                                }}
                                style={{
                                    marginHorizontal: spaceWidth
                                }}
                            >
                                <TabMidle tab={el} title={el.title} isActive={isActive} {...this.props} />
                            </TouchableOpacity>
                        );
                    } else {
                        if (index === 1 && this.tabs.length > 3) {
                            return (
                                <TouchableOpacity
                                    disabled={!!disableChangeTab}
                                    onPress={() => {
                                        this.setState({
                                            activeTab: el.key
                                        });
                                        onChangeTab(el)
                                    }}
                                >
                                    <TabMidle tab={el} title={el.title} isActive={isActive} {...this.props} />
                                </TouchableOpacity>
                            );
                        }
                    }
                    return (
                        <TouchableOpacity
                            disabled={!!disableChangeTab}
                            onPress={() => {
                                this.setState({
                                    activeTab: el.key
                                });
                                onChangeTab(el)
                            }}
                        >
                            <TabMidle tab={el} title={el.title} isActive={isActive} {...this.props} />
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    app: {
        flexDirection: 'row'
    }
});

export default App;
