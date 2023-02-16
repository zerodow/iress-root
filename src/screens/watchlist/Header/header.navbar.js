import React, { PureComponent } from 'react';
import {
	View,
	Text
} from 'react-native';
import CommonStyle from '~/theme/theme_controller';
import * as Channel from '~/streaming/channel';
import I18n from '~/modules/language/';
import * as Emitter from '@lib/vietnam-emitter';
import NavBar from '~s/universal_search.1/universal/topBar/universal_search.navBar';

export default class HeaderNavbar extends PureComponent {
	backWatchlist() {
		Emitter.emit('change_header_watchlist_unis', {
			isClose: true,
			isShow: false
		});
	}

	render() {
		return (
			<React.Fragment>
				<View style={{
					height: 54,
					position: 'absolute',
					top: 0,
					backgroundColor:
						CommonStyle.navigatorSpecial.navBarBackgroundColor,
					width: '100%',
					flexDirection: 'row',
					alignItems: 'center'
				}}>
					<NavBar
						style={{ marginTop: 0, height: 54, paddingTop: 0, paddingLeft: 0 }}
						channelLoading={Channel.getChannelLoadingSearch()}
						navigator={this.props.navigator}
						title={I18n.t('universalSearch')}
						backToSearch={this.backWatchlist}
						c2r={() => { }}
					/>
				</View>
			</React.Fragment>
		);
	}
}
