import { StyleSheet } from 'react-native';

export default function getStyles(isDarkTheme) {
	return StyleSheet.create({
		topBar: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingHorizontal: 25,
			paddingTop: 25,
			backgroundColor: 'transparent',
		},
		title: {
			fontSize: 18,
			fontWeight: 'bold',
			color: isDarkTheme ? '#e8eaed' : '#333',
		},
	});
}
