import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated } from 'react-native';
import { Sun, MoonStar } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { selectIsDarkTheme } from '../store/themeSlice';
import getStyles from './ThemeToggle.styles';

export default function ThemeToggle({ onToggle }) {
	const isDarkTheme = useSelector(selectIsDarkTheme);
	const styles = getStyles(isDarkTheme);
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
		<TouchableOpacity style={styles.toggleContainer} onPress={onToggle} activeOpacity={0.8}>
			<Animated.View style={[styles.toggleCircle, { transform: [{ translateX }] }]}>
				{isDarkTheme ? (
					<MoonStar size={16} color="#e8eaed" />
				) : (
					<Sun size={16} color="#202124" />
				)}
			</Animated.View>
		</TouchableOpacity>
	);
}
