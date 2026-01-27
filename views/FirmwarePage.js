import { StatusBar } from 'expo-status-bar';
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	Alert,
	TextInput,
	ActivityIndicator,
} from 'react-native';
import { useState, useRef } from 'react';
import * as DocumentPicker from 'expo-document-picker';

export default function FirmwarePage({ isDarkTheme }) {
	const [selectedFile, setSelectedFile] = useState(null);
	const [ip, setIp] = useState('192.168.10.140');
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const xhrRef = useRef(null);

	const selectFile = async () => {
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: '*/*', // Allow all file types
				copyToCacheDirectory: true, // Copy to cache for FTP access
			});

			if (!result.canceled && result.assets && result.assets.length > 0) {
				const file = result.assets[0];
				setSelectedFile({
					name: file.name,
					uri: file.uri,
				});
			}
		} catch (error) {
			Alert.alert('Error', 'Failed to select file');
			console.error('File selection error:', error);
		}
	};

	const uploadViaEndpoint = async () => {
		if (!selectedFile) return Alert.alert('No file', 'Please select a file first');
		if (!ip) return Alert.alert('Missing IP', 'Please provide an IP address');

		const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		const uploadUrl = `http://${ip}:4000/upload?uploadId=${uploadId}`;

		setUploadProgress(0);

		try {
			setUploading(true);

			// prepare form
			const form = new FormData();
			console.log(selectedFile);
			form.append('file', {
				uri: selectedFile.uri,
				name: selectedFile.name,
				type: 'application/octet-stream',
			});

			// send via XHR so we can get client-side progress fallback and ensure streaming
			xhrRef.current = new XMLHttpRequest();
			xhrRef.current.open('POST', uploadUrl);
			xhrRef.current.onload = () => {
				if (xhrRef.current.status >= 200 && xhrRef.current.status < 300) {
					try {
						const json = JSON.parse(xhrRef.current.responseText || '{}');
						console.log('Upload response:', json);
					} catch (e) {}
					Alert.alert('Success', `File uploaded: ${selectedFile.name}`);
				} else {
					Alert.alert('Upload failed', `Status ${xhrRef.current.status}`);
				}
				setUploading(false);
			};
			xhrRef.current.onerror = () => {
				Alert.alert('Upload failed', 'Network error');
				setUploading(false);
			};
			xhrRef.current.upload.onprogress = (ev) => {
				if (ev.lengthComputable) {
					console.log({ loaded: ev.loaded, total: ev.total, div: ev.loaded / ev.total });
					const pct = Math.round((ev.loaded / (ev.total * 2)) * 100);
					console.log({ pct });
					setUploadProgress(pct);
				}
			};
			xhrRef.current.send(form);
		} catch (err) {
			console.error('Upload error:', err);
			Alert.alert('Upload failed', err.message || String(err));
			setUploading(false);
		}
	};

	return (
		<View style={[styles.container, { backgroundColor: isDarkTheme ? '#202124' : '#f5f5f5' }]}>
			<View style={[styles.card, { backgroundColor: isDarkTheme ? '#292a2d' : '#fff' }]}>
				<View style={styles.form}>
					<TextInput
						style={[
							styles.input,
							{
								backgroundColor: isDarkTheme ? '#3c4043' : '#f5f5f5',
								color: isDarkTheme ? '#e8eaed' : '#333',
								borderColor: isDarkTheme ? '#5f6368' : '#ddd',
							},
						]}
						// placeholder="Upload Endpoint (e.g. http://192.168.1.x:4000/upload)"
						value={ip}
						onChangeText={setIp}
						autoCapitalize="none"
					/>
				</View>

				<View style={styles.buttonRow}>
					<TouchableOpacity
						style={[
							styles.button,
							{ backgroundColor: isDarkTheme ? '#8ab4f8' : '#007AFF' },
						]}
						onPress={selectFile}
					>
						<Text
							style={[styles.buttonText, { color: isDarkTheme ? '#202124' : '#fff' }]}
						>
							{selectedFile ? 'Select Different File' : 'Select File'}
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[
							styles.button,
							{
								backgroundColor:
									selectedFile == null || uploading
										? isDarkTheme
											? '#5f6368'
											: '#cccccc'
										: isDarkTheme
										? '#81c995'
										: '#28a745',
							},
							(selectedFile == null || uploading) && { opacity: 0.6 },
						]}
						onPress={uploadViaEndpoint}
						disabled={selectedFile == null || uploading}
					>
						{uploading ? (
							<ActivityIndicator color={isDarkTheme ? '#81c995' : '#28a745'} />
						) : (
							<Text
								style={[
									styles.buttonText,
									{ color: isDarkTheme ? '#202124' : '#fff' },
								]}
							>
								Upload
							</Text>
						)}
					</TouchableOpacity>
				</View>

				{uploading && (
					<View style={styles.progressContainer}>
						<View
							style={[
								styles.progressBackground,
								{ backgroundColor: isDarkTheme ? '#3c4043' : '#eee' },
							]}
						>
							<View
								style={[
									styles.progressBar,
									{
										width: `${uploadProgress}%`,
										backgroundColor: isDarkTheme ? '#81c995' : '#28a745',
									},
								]}
							/>
						</View>
						<Text
							style={[
								styles.progressText,
								{ color: isDarkTheme ? '#9aa0a6' : '#333' },
							]}
						>
							{uploadProgress}%
						</Text>
					</View>
				)}

				{selectedFile && (
					<View
						style={[
							styles.uriContainer,
							{ backgroundColor: isDarkTheme ? '#3c4043' : '#f8f8f8' },
						]}
					>
						<Text
							style={[styles.uriLabel, { color: isDarkTheme ? '#9aa0a6' : '#666' }]}
						>
							Selected File:
						</Text>
						<Text style={[styles.uriText, { color: isDarkTheme ? '#e8eaed' : '#333' }]}>
							{selectedFile.name}
						</Text>
						<Text
							style={[styles.uriLabel, { color: isDarkTheme ? '#9aa0a6' : '#666' }]}
						>
							File URI:
						</Text>
						<Text style={[styles.uriText, { color: isDarkTheme ? '#e8eaed' : '#333' }]}>
							{selectedFile.uri}
						</Text>
					</View>
				)}
			</View>

			<StatusBar style="auto" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
	},
	card: {
		borderRadius: 12,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 3,
	},
	fileInfo: {
		alignItems: 'center',
		marginBottom: 20,
		padding: 15,
		backgroundColor: '#3c4043',
		borderRadius: 8,
	},
	fileLabel: {
		fontSize: 16,
		color: '#9aa0a6',
		marginBottom: 5,
	},
	fileName: {
		fontSize: 18,
		fontWeight: '600',
		color: '#e8eaed',
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
		borderColor: '#5f6368',
		borderRadius: 8,
		fontSize: 14,
		backgroundColor: '#3c4043',
		color: '#e8eaed',
	},
	buttonRow: {
		flexDirection: 'row',
		gap: 10,
		marginBottom: 20,
	},
	button: {
		flex: 1,
		backgroundColor: '#8ab4f8',
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	uploadButton: {
		backgroundColor: '#81c995',
	},
	buttonDisabled: {
		backgroundColor: '#5f6368',
		opacity: 0.6,
	},
	buttonText: {
		color: '#202124',
		fontSize: 16,
		fontWeight: '600',
	},
	uriContainer: {
		marginTop: 10,
		padding: 15,
		backgroundColor: '#3c4043',
		borderRadius: 8,
		maxWidth: '100%',
	},
	uriLabel: {
		fontSize: 14,
		color: '#9aa0a6',
		marginBottom: 5,
		fontWeight: '500',
	},
	uriText: {
		fontSize: 12,
		color: '#e8eaed',
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
		backgroundColor: '#3c4043',
		borderRadius: 6,
		overflow: 'hidden',
	},
	progressBar: {
		height: 12,
		backgroundColor: '#81c995',
	},
	progressText: {
		marginTop: 6,
		fontSize: 12,
		color: '#9aa0a6',
	},
});
