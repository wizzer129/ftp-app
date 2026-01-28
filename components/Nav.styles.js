import { StyleSheet } from 'react-native';

export default function getStyles(isDarkTheme) {
	return StyleSheet.create({
		navContainer: {
			flexDirection: 'row',
			borderTopWidth: 1,
			paddingVertical: 10,
			paddingHorizontal: 5,
			marginBottom: 50,
			backgroundColor: isDarkTheme ? '#292a2d' : '#fff',
			borderTopColor: isDarkTheme ? '#5f6368' : '#ddd',
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
			color: isDarkTheme ? '#9aa0a6' : '#666',
		},
	});
}
