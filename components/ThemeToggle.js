import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, View, Animated, Text, StyleSheet } from 'react-native';
import { Sun, MoonStar } from 'lucide-react-native';

export default function ThemeToggle({ isDarkTheme, onToggle }) {
	const translateX = useRef(new Animated.Value(isDarkTheme ? 0 : 22)).current;

	useEffect(() => {
		Animated.spring(translateX, {
			toValue: isDarkTheme ? 0 : 22,
			useNativeDriver: true,
			tension: 100,
			friction: 8,
		}).start();
	}, [isDarkTheme]);

	return (
		<TouchableOpacity
			style={[
				styles.toggleContainer,
				{ backgroundColor: isDarkTheme ? '#5f6368' : '#8ab4f8' },
			]}
			onPress={onToggle}
			activeOpacity={0.8}
		>
			<Animated.View
				style={[
					styles.toggleCircle,
					{
						transform: [{ translateX }],
						backgroundColor: isDarkTheme ? '#292a2d' : '#fff',
					},
				]}
			>
				{isDarkTheme ? (
					<MoonStar size={16} color="#e8eaed" />
				) : (
					<Sun size={16} color="#202124" />
				)}
			</Animated.View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	toggleContainer: {
		width: 55,
		height: 30,
		borderRadius: 16,
		padding: 2,
		justifyContent: 'center',
	},
	toggleCircle: {
		width: 28,
		height: 28,
		borderRadius: 14,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
		elevation: 3,
		justifyContent: 'center',
		alignItems: 'center',
	},
	icon: {
		fontSize: 14,
	},
});
