import { StatusBar } from 'expo-status-bar';
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	Alert,
	TextInput,
	ActivityIndicator,
	Platform,
} from 'react-native';
import { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';

let FTPClient;
try {
	FTPClient = require('react-native-ftp-client');
} catch (e) {
	console.warn('FTP Client not available:', e.message);
}

export default function App() {
	const [selectedFile, setSelectedFile] = useState(null);
	const [host, setHost] = useState('');
	const [port, setPort] = useState('21');
	const [user, setUser] = useState('');
	const [password, setPassword] = useState('');
	const [remotePath, setRemotePath] = useState('');
	const [uploading, setUploading] = useState(false);

	const selectFile = async () => {
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: '*/*', // Allow all file types
				copyToCacheDirectory: false,
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

	const uploadViaFTP = async () => {
		if (!selectedFile) return Alert.alert('No file', 'Please select a file first');
		if (!host || !user)
			return Alert.alert('Missing credentials', 'Please provide host and user');

		if (!FTPClient) {
			return Alert.alert(
				'FTP Not Available',
				'This app requires a development build to use FTP. Please build with "npx expo run:android" or "npx expo run:ios"'
			);
		}

		try {
			setUploading(true);

			// Initialize FTP client
			const ftpClient = new FTPClient();

			// Setup FTP connection
			await ftpClient.setup({
				ip_address: host,
				port: parseInt(port) || 2121,
				username: user,
				password: password,
			});

			// Convert file URI to a local path
			let localPath = selectedFile.uri;

			// Handle different URI schemes
			if (localPath.startsWith('file://')) {
				localPath = localPath.replace('file://', '');
			} else if (localPath.startsWith('content://')) {
				// For Android content URIs, we'll need to handle this differently
				// The library should handle this, but if not, additional conversion may be needed
			}

			// Decode URI components (handle spaces and special characters)
			localPath = decodeURIComponent(localPath);

			// Determine remote file path
			const fileName = selectedFile.name;
			const remoteFilePath = remotePath ? `${remotePath}/${fileName}` : fileName;

			// Upload the file
			await ftpClient.uploadFile(localPath, remoteFilePath);

			// Disconnect
			await ftpClient.disconnect();

			Alert.alert('Success', `File uploaded: ${fileName}`);
		} catch (err) {
			console.error('Upload error:', err);
			Alert.alert('Upload failed', err.message || String(err));
		} finally {
			setUploading(false);
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>File Selection App</Text>

			{selectedFile && (
				<View style={styles.fileInfo}>
					<Text style={styles.fileLabel}>Selected File:</Text>
					<Text style={styles.fileName}>{selectedFile.name}</Text>
				</View>
			)}

			<TouchableOpacity style={styles.selectButton} onPress={selectFile}>
				<Text style={styles.buttonText}>
					{selectedFile ? 'Select Different File' : 'Select File'}
				</Text>
			</TouchableOpacity>

			<View style={styles.form}>
				<TextInput
					style={styles.input}
					placeholder="FTP Host"
					value={host}
					onChangeText={setHost}
					autoCapitalize="none"
				/>
				<TextInput
					style={styles.input}
					placeholder="Port (default 21)"
					value={port}
					onChangeText={setPort}
					keyboardType="numeric"
				/>
				<TextInput
					style={styles.input}
					placeholder="User"
					value={user}
					onChangeText={setUser}
					autoCapitalize="none"
				/>
				<TextInput
					style={styles.input}
					placeholder="Password"
					value={password}
					onChangeText={setPassword}
					secureTextEntry
				/>
				<TextInput
					style={styles.input}
					placeholder="Remote Path (optional)"
					value={remotePath}
					onChangeText={setRemotePath}
					autoCapitalize="none"
				/>
			</View>

			<TouchableOpacity
				style={[styles.selectButton, styles.uploadButton]}
				onPress={uploadViaFTP}
				disabled={uploading}
			>
				{uploading ? (
					<ActivityIndicator color="white" />
				) : (
					<Text style={styles.buttonText}>Upload To FTP</Text>
				)}
			</TouchableOpacity>

			{selectedFile && (
				<View style={styles.uriContainer}>
					<Text style={styles.uriLabel}>File URI:</Text>
					<Text style={styles.uriText}>{selectedFile.uri}</Text>
				</View>
			)}

			<StatusBar style="auto" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
		padding: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 30,
		color: '#333',
	},
	fileInfo: {
		alignItems: 'center',
		marginBottom: 20,
		padding: 15,
		backgroundColor: '#f0f0f0',
		borderRadius: 8,
		minWidth: '80%',
	},
	fileLabel: {
		fontSize: 16,
		color: '#666',
		marginBottom: 5,
	},
	fileName: {
		fontSize: 18,
		fontWeight: '600',
		color: '#333',
		textAlign: 'center',
	},
	form: {
		width: '100%',
		marginTop: 10,
		marginBottom: 10,
		alignItems: 'center',
	},
	input: {
		width: '90%',
		padding: 10,
		borderWidth: 1,
		borderColor: '#ddd',
		borderRadius: 6,
		marginBottom: 8,
		fontSize: 14,
	},
	uploadButton: {
		backgroundColor: '#28a745',
	},
	selectButton: {
		backgroundColor: '#007AFF',
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 8,
		marginBottom: 20,
	},
	buttonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
	},
	uriContainer: {
		marginTop: 10,
		padding: 15,
		backgroundColor: '#f8f8f8',
		borderRadius: 8,
		maxWidth: '90%',
	},
	uriLabel: {
		fontSize: 14,
		color: '#666',
		marginBottom: 5,
		fontWeight: '500',
	},
	uriText: {
		fontSize: 12,
		color: '#333',
		fontFamily: 'monospace',
		flexWrap: 'wrap',
	},
});
