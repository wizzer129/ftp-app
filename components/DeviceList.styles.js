import { StyleSheet } from 'react-native';

export default function getStyles(isDarkTheme) {
	return StyleSheet.create({
		card: {
			flexDirection: 'row',
			padding: 10,
			marginVertical: 5,
			backgroundColor: isDarkTheme ? '#1e1f21' : '#fff',
			borderRadius: 5,
			shadowColor: '#000',
			shadowOffset: {
				width: 0,
				height: 2,
			},
			shadowOpacity: 0.2,
			shadowRadius: 2,
			elevation: 1,
		},
		thumb: {
			width: 64,
			height: 64,
			marginRight: 10,
			backgroundColor: isDarkTheme ? '#2a2b2d' : '#f0f0f0',
		},
		info: {
			flex: 1,
			justifyContent: 'center',
		},
		label: {
			fontSize: 14,
			color: isDarkTheme ? '#e8eaed' : '#333',
		},
		value: {
			fontWeight: 'bold',
			color: isDarkTheme ? '#fff' : '#111',
		},
		list: {
			padding: 10,
		},
		empty: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
		},
		emptyText: {
			fontSize: 16,
			color: isDarkTheme ? '#9aa0a6' : '#999',
		},
		cardSmall: {
			flexDirection: 'row',
			alignItems: 'center',
			padding: 8,
			backgroundColor: isDarkTheme ? '#2b2c2e' : '#fafafa',
			borderRadius: 6,
			marginTop: 8,
			width: '100%',
		},
		thumbSmall: {
			width: 40,
			height: 40,
			marginRight: 8,
		},
		infoSmall: {
			flex: 1,
			justifyContent: 'center',
		},
		labelSmall: {
			fontSize: 13,
			color: isDarkTheme ? '#e8eaed' : '#444',
		},
	});
}
