import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import _ from 'lodash';
import { SvgXml } from 'react-native-svg';

import CommonStyle from '~/theme/theme_controller';

/*
--------POSITION---------
0. top and bottom
1. top
2. bottom
*/
export const useShadow = (
	position = 0,
	options = { blur: 5, x: 0, y: 0, rx: 0, ry: 0 }
) => {
	const [layout, setLayout] = useState();

	const onLayout = useCallback((event) => {
		setLayout(event.nativeEvent.layout);
	}, []);

	const Content = ({ style }) => (
		<SvgShadow
			position={position}
			options={options}
			style={style}
			layout={layout}
		/>
	);
	return [Content, onLayout];
};

export const SvgShadow = ({ style, layout = {}, options, position }) => {
	if (_.isEmpty(layout)) {
		return null;
	}
	const { blur, x, y, rx, ry } = options;
	const totalHeight =
		position === 0 ? layout.height + 2 * blur : layout.height + blur;
	const totalWidth = layout.width;
	const deltaOffset = (blur / totalHeight) * 100;
	const offsetArray = [0, deltaOffset, 100 - deltaOffset, 100];
	const xml = `
    <svg width="${totalWidth}" height="${totalHeight}">
        <defs>
            <linearGradient id="Gradient2" x1="0" x2="0" y1="0" y2="1">
                <stop offset="${offsetArray[0]}%" stop-color="${CommonStyle.color.shadow}" stop-opacity="0"/>
                <stop offset="${offsetArray[1]}%" stop-color="${CommonStyle.color.shadow}" stop-opacity="0.5"/>
                <stop offset="${offsetArray[2]}%" stop-color="${CommonStyle.color.shadow}" stop-opacity="0.5"/>
                <stop offset="${offsetArray[3]}%" stop-color="${CommonStyle.color.shadow}" stop-opacity="0"/>
            </linearGradient>
        </defs>
        <rect x="${x}" y="${y}" rx="${rx}" ry="${ry}" width="${totalWidth}" height="${totalHeight}" fill="url(#Gradient2)"/>
    </svg>
  `;

	const svgContent = useMemo(
		() => <SvgXml xml={xml} width={'100%'} height={'100%'} />,
		xml
	);
	return (
		<View
			style={[
				{
					zIndex: 9,
					position: 'absolute',
					height: totalHeight,
					top: position === 0 || position === 1 ? -blur : 0,
					bottom: position === 0 || position === 2 ? -blur : 0,
					width: totalWidth
				},
				style
			]}
		>
			{svgContent}
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
