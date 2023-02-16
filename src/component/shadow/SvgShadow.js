import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import _ from 'lodash';
import { SvgXml } from 'react-native-svg';

import CommonStyle from '~/theme/theme_controller';

export const useShadow = () => {
	const [layout, setLayout] = useState();

	const onLayout = useCallback((event) => {
		setLayout(event.nativeEvent.layout);
	}, []);

	const Content = ({ style, ...rest }) => <SvgShadow {...rest} style={style} layout={layout} />;

	return [Content, onLayout];
};

const SvgShadow = ({ style, layout = {}, heightShadow = 5, stopOpacity = 0, customRect = '' }) => {
	if (_.isEmpty(layout)) {
		return null;
	}

	const height = heightShadow || 5;

	const xml = `
    <svg height="${height}" width="${layout.width}">
        <defs>
            <linearGradient id="Gradient2" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="${CommonStyle.color.shadow}" stop-opacity="0.5"/>
                <stop offset="100%" stop-color="${CommonStyle.color.shadow}" stop-opacity="${stopOpacity}"/>
            </linearGradient>
        </defs>

        <rect  ${customRect} width="${layout.width}" height="${height}" fill="url(#Gradient2)"/>
    </svg>
  `;

	const xmlContent = useMemo(
		() => <SvgXml xml={xml} width={'100%'} height={'100%'} />,
		xml
	);
	return (
		<View
			style={[
				{
					zIndex: 9,
					position: 'absolute',
					height,
					top: layout.height,
					width: layout.width
				},
				style
			]}
		>
			{xmlContent}
		</View>
	);
};

export default SvgShadow;

SvgShadow.defaultProps = {
	stdDeviation: 20, // độ nhòe
	dx: 10, // offset shadow
	dy: 10
};

const styles = StyleSheet.create({});
