import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ThemeToggle from './ThemeToggle';

export default function TopBar({ title, isDarkTheme, onToggleTheme }) {
	return (
		<View style={styles.topBar}>
			<Text style={[styles.title, { color: isDarkTheme ? '#e8eaed' : '#333' }]}>{title}</Text>
			<ThemeToggle isDarkTheme={isDarkTheme} onToggle={onToggleTheme} />
		</View>
	);
}

const styles = StyleSheet.create({
	topBar: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 35,
		paddingTop: 40,
		paddingBottom: 10,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
	},
});
