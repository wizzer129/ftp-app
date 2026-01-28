import { StyleSheet } from 'react-native';

export default function getStyles(isDarkTheme) {
	return StyleSheet.create({
		toggleContainer: {
			width: 55,
			height: 30,
			borderRadius: 16,
			padding: 2,
			justifyContent: 'center',
			backgroundColor: isDarkTheme ? '#5f6368' : '#8ab4f8',
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
			backgroundColor: isDarkTheme ? '#292a2d' : '#fff',
		},
		icon: {
			fontSize: 14,
		},
	});
}
