import { StyleSheet } from 'react-native';

export default function getStyles(isDarkTheme) {
	return StyleSheet.create({
		container: {
			flex: 1,
			padding: 20,
			backgroundColor: isDarkTheme ? '#202124' : '#f5f5f5',
		},
		card: {
			borderRadius: 12,
			padding: 20,
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.3,
			shadowRadius: 4,
			elevation: 3,
			backgroundColor: isDarkTheme ? '#292a2d' : '#fff',
		},
		fileInfo: {
			alignItems: 'center',
			marginBottom: 20,
			padding: 15,
			backgroundColor: isDarkTheme ? '#3c4043' : '#f0f0f0',
			borderRadius: 8,
		},
		fileLabel: {
			fontSize: 16,
			color: isDarkTheme ? '#9aa0a6' : '#666',
			marginBottom: 5,
		},
		fileName: {
			fontSize: 18,
			fontWeight: '600',
			color: isDarkTheme ? '#e8eaed' : '#111',
			textAlign: 'center',
		},
		form: {
			width: '100%',
			marginBottom: 20,
		},
		input: {
			width: '100%',
			padding: 12,
			borderWidth: 1,
			borderColor: isDarkTheme ? '#5f6368' : '#ddd',
			borderRadius: 8,
			fontSize: 14,
			backgroundColor: isDarkTheme ? '#3c4043' : '#fff',
			color: isDarkTheme ? '#e8eaed' : '#333',
		},
		buttonRow: {
			flexDirection: 'row',
			gap: 10,
			marginBottom: 20,
		},
		button: {
			flex: 1,
			paddingVertical: 12,
			borderRadius: 8,
			alignItems: 'center',
			justifyContent: 'center',
		},
		uploadButtonBg: {
			backgroundColor: isDarkTheme ? '#81c995' : '#28a745',
		},
		primaryButtonBg: {
			backgroundColor: isDarkTheme ? '#8ab4f8' : '#007AFF',
		},
		disabledButtonBg: {
			backgroundColor: isDarkTheme ? '#5f6368' : '#cccccc',
		},
		buttonText: {
			color: isDarkTheme ? '#222' : '#fff',
			fontSize: 16,
			fontWeight: '500',
		},
		uriContainer: {
			marginTop: 10,
			padding: 15,
			backgroundColor: isDarkTheme ? '#3c4043' : '#f8f8f8',
			borderRadius: 8,
			maxWidth: '100%',
		},
		uriLabel: {
			fontSize: 14,
			color: isDarkTheme ? '#9aa0a6' : '#666',
			marginBottom: 2,
			fontWeight: '500',
		},
		uriText: {
			fontSize: 12,
			color: isDarkTheme ? '#e8eaed' : '#333',
			marginBottom: 5,
			fontFamily: 'monospace',
			flexWrap: 'wrap',
		},
		progressContainer: {
			width: '100%',
			alignItems: 'center',
			marginTop: 8,
		},
		progressBackground: {
			width: '100%',
			height: 12,
			backgroundColor: isDarkTheme ? '#3c4043' : '#eee',
			borderRadius: 6,
			overflow: 'hidden',
		},
		progressBar: {
			height: 12,
			backgroundColor: isDarkTheme ? '#81c995' : '#28a745',
		},
		progressText: {
			marginTop: 6,
			fontSize: 12,
			color: isDarkTheme ? '#9aa0a6' : '#333',
		},
	});
}
