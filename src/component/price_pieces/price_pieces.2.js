import PropTypes from 'prop-types';
import XComponent from '../../component/xComponent/xComponent';
import * as Util from '../../util';
import * as Emitter from '@lib/vietnam-emitter';

export default class PricePieces extends XComponent {
    static propTypes = {
        value: PropTypes.object,
        channelLv1FromComponent: PropTypes.string,
        isLoading: PropTypes.bool,
        channelLoadingTrade: PropTypes.string,
        formatFunc: PropTypes.func.isRequired,
        isValueChange: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.onLoading = this.onLoading.bind(this);
        this.onValueChange = this.onValueChange.bind(this);

        this.dic = {
            value: this.props.value || {},
            isLoading: Util.getBooleanable(this.props.isLoading)
        };
    }

    componentDidMount() {
        super.componentDidMount();

        Emitter.addListener(this.props.channelLv1FromComponent, this.id, this.onValueChange);
        Emitter.addListener(this.props.channelLoadingTrade, this.id, this.onLoading);
    }

    onLoading(data) {
        if (this.dic.isLoading === data) return;
        this.dic.isLoading = data;
        this.setStateLowPriority();
    }

    onValueChange(data) {
        if (!data) return;
        if (this.props.isValueChange(this.dic.value, data)) {
            this.dic.value = data;
            this.setStateLowPriority();
        } else {
            this.dic.value = data;
        }
    }

    render() {
        return this.props.formatFunc(this.dic.value, this.dic.isLoading)
    }
}
