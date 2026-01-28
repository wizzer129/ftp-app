import { StyleSheet } from 'react-native';

export default function getStyles(isDarkTheme) {
	return StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: isDarkTheme ? '#202124' : '#f5f5f5',
		},
		content: {
			flex: 1,
		},
		placeholder: {
			flex: 1,
			backgroundColor: isDarkTheme ? '#202124' : '#f5f5f5',
		},
	});
}
