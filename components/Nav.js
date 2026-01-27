import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function Nav({ currentTab, onTabChange, isDarkTheme }) {
	const tabs = [
		{ id: 'firmware', label: 'Firmware' },
		{ id: 'settings', label: 'Settings' },
	];

	return (
		<View
			style={[
				styles.navContainer,
				{
					backgroundColor: isDarkTheme ? '#292a2d' : '#fff',
					borderTopColor: isDarkTheme ? '#5f6368' : '#ddd',
				},
			]}
		>
			{tabs.map((tab) => (
				<TouchableOpacity
					key={tab.id}
					style={[
						styles.navButton,
						currentTab === tab.id && {
							backgroundColor: isDarkTheme ? '#8ab4f8' : '#007AFF',
						},
					]}
					onPress={() => onTabChange(tab.id)}
				>
					<Text
						style={[
							styles.navText,
							{ color: isDarkTheme ? '#9aa0a6' : '#666' },
							currentTab === tab.id && { color: isDarkTheme ? '#202124' : '#fff' },
						]}
					>
						{tab.label}
					</Text>
				</TouchableOpacity>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	navContainer: {
		flexDirection: 'row',
		borderTopWidth: 1,
		paddingVertical: 10,
		paddingHorizontal: 5,
		marginBottom: 50,
	},
	navButton: {
		flex: 1,
		paddingVertical: 12,
		alignItems: 'center',
		marginHorizontal: 5,
		borderRadius: 8,
	},
	navText: {
		fontSize: 16,
		fontWeight: '500',
	},
});
