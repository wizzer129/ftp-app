import { StyleSheet } from 'react-native';

export default function getStyles(isDarkTheme) {
	return StyleSheet.create({
		card: {
			flexDirection: 'row',
			alignItems: 'center',
			padding: 12,
			borderRadius: 14,
			backgroundColor: isDarkTheme ? '#101214' : '#ffffff',
		},
		image: {
			width: 64,
			height: 64,
			borderRadius: 8,
			marginRight: 12,
			backgroundColor: isDarkTheme ? '#2a2a2a' : '#e9e9e9',
		},
		info: {
			flex: 1,
			justifyContent: 'center',
		},
		name: {
			fontSize: 16,
			fontWeight: '700',
			color: isDarkTheme ? '#fff' : '#111',
			marginBottom: 4,
		},
		ip: {
			fontSize: 13,
			color: isDarkTheme ? '#9aa0a6' : '#666',
		},
		selectedCard: {
			borderWidth: 3,
			borderColor: isDarkTheme ? '#8ab4f8' : '#007AFF',
		},
	});
}
