import React from 'react';
import { View, Text } from 'react-native';
import ThemeToggle from './ThemeToggle';
import { useSelector } from 'react-redux';
import { selectIsDarkTheme } from '../store/themeSlice';
import getStyles from './TopBar.styles';

export default function TopBar({ title, onToggleTheme }) {
	const isDarkTheme = useSelector(selectIsDarkTheme);
	const styles = getStyles(isDarkTheme);

	return (
		<View style={styles.topBar}>
			<Text style={styles.title}>{title}</Text>
			<ThemeToggle onToggle={onToggleTheme} />
		</View>
	);
}
