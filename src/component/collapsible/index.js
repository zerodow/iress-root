import React, { PureComponent } from 'react';
import {
    TouchableOpacity,
    View,
    Animated,
    LayoutAnimation,
    UIManager
} from 'react-native';
import PropTypes from 'prop-types';

if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default class PureCollapsible extends PureComponent {
    static propTypes = {
        onChange: PropTypes.func,
        renderHeader: PropTypes.func.isRequired,
        renderContent: PropTypes.func.isRequired,
        isExpand: PropTypes.bool
    };

    constructor(props) {
        super(props);

        this.onClick = this.onClick.bind(this);

        this.state = {
            isExpand:
                typeof this.props.isExpand === 'boolean'
                    ? this.props.isExpand
                    : false
        };
    }

    onClick() {
        this.props.onChange && this.props.onChange(!this.state.isExpand);
        this.props.animation && LayoutAnimation.easeInEaseOut();
        this.setState({
            isExpand: !this.state.isExpand
        });
    }
    collap = () => {
        this.props.onChange && this.props.onChange(false);
        this.props.animation && LayoutAnimation.easeInEaseOut();
        this.setState(prevState => ({
            isExpand: false
        }));
    }
    expand = () => {
        this.props.onChange && this.props.onChange(true);
        this.props.animation && LayoutAnimation.easeInEaseOut();
        this.setState(prevState => ({
            isExpand: true
        }));
    }
    componentWillReceiveProps(nextProps) {
        if (typeof nextProps.isExpand === 'boolean') {
            this.state.isExpand = nextProps.isExpand;
        }
    }

    render() {
        return (
            <React.Fragment>
                {this.props.renderHeader({ onChange: this.onClick, isExpand: this.state.isExpand })}
                {this.state.isExpand ? this.props.renderContent() : <View />}
            </React.Fragment>
        );
    }
}

PureCollapsible.defaultProps = {
    animation: true
}
