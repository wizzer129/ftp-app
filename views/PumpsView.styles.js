import { StyleSheet } from 'react-native';

export default function getStyles(isDarkTheme) {
	return StyleSheet.create({
		container: {
			flex: 1,
			padding: 16,
			backgroundColor: isDarkTheme ? '#202124' : '#f7f7f7',
		},
		card: {
			borderRadius: 12,
			padding: 14,
			backgroundColor: isDarkTheme ? '#101214' : '#ffffff',
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 1 },
			shadowOpacity: 0.08,
			shadowRadius: 6,
			elevation: 2,
			marginBottom: 12,
			flexDirection: 'row',
		},
		scanPill: {
			alignSelf: 'flex-start',
			paddingHorizontal: 16,
			paddingVertical: 8,
			borderRadius: 999,
			backgroundColor: isDarkTheme ? '#8ab4f8' : '#007AFF',
		},
		scanText: {
			color: isDarkTheme ? '#101214' : '#fff',
			fontWeight: '600',
			fontSize: 14,
		},
		label: {
			marginTop: 8,
			marginBottom: 6,
			color: isDarkTheme ? '#cfd5da' : '#333',
			fontSize: 13,
			fontWeight: '600',
		},
		pumpList: {
			borderRadius: 12,
			backgroundColor: isDarkTheme ? '#101214' : '#ffffff',
		},
	});
}
