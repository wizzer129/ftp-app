import { StatusBar } from 'expo-status-bar';
import { Text, View, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import getStyles from './FirmwarePage.styles';
import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectIsDarkTheme } from '../store/themeSlice';
import * as DocumentPicker from 'expo-document-picker';
import DeviceList from '../components/DeviceList';

export default function FirmwarePage() {
	const isDarkTheme = useSelector(selectIsDarkTheme);
	const styles = getStyles(isDarkTheme);
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
		<View style={styles.container}>
			<View style={styles.card}>
				<View style={styles.form}>
					<TextInput
						style={styles.input}
						value={ip}
						onChangeText={setIp}
						autoCapitalize="none"
					/>
				</View>

				<View style={styles.buttonRow}>
					<TouchableOpacity
						style={[styles.button, styles.primaryButtonBg]}
						onPress={selectFile}
					>
						<Text style={styles.buttonText}>
							{selectedFile ? 'Change FW' : 'Select FW'}
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={
							selectedFile == null || uploading
								? [styles.button, styles.disabledButtonBg, { opacity: 0.6 }]
								: [styles.button, styles.uploadButtonBg]
						}
						onPress={uploadViaEndpoint}
						disabled={selectedFile == null || uploading}
					>
						{uploading ? (
							<ActivityIndicator color={isDarkTheme ? '#81c995' : '#28a745'} />
						) : (
							<Text style={styles.buttonText}>Upload</Text>
						)}
					</TouchableOpacity>
				</View>

				{uploading && (
					<View style={styles.progressContainer}>
						<View style={styles.progressBackground}>
							<View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
						</View>
						<Text style={styles.progressText}>{uploadProgress}%</Text>
					</View>
				)}

				{selectedFile && (
					<View style={styles.uriContainer}>
						<Text style={styles.uriLabel}>Selected File:</Text>
						<Text style={styles.uriText}>{selectedFile.name}</Text>
						<Text style={styles.uriLabel}>File URI:</Text>
						<Text style={styles.uriText}>{selectedFile.uri}</Text>
					</View>
				)}
			</View>

			<StatusBar style="auto" />
		</View>
	);
}
