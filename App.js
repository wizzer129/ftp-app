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
import { useState, useRef } from 'react';
import * as DocumentPicker from 'expo-document-picker';

export default function App() {
	const [selectedFile, setSelectedFile] = useState(null);
	const [host, setHost] = useState('192.168.1.200');
	const [port, setPort] = useState('2121');
	const [user, setUser] = useState('admin');
	const [password, setPassword] = useState('admin');
	const [remotePath, setRemotePath] = useState('');
	const [endpoint, setEndpoint] = useState('http://192.168.1.200:4000/upload');
	const [uploading, setUploading] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const wsRef = useRef(null);
	const xhrRef = useRef(null);
	const pollRef = useRef(null);

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
		if (!endpoint) return Alert.alert('Missing endpoint', 'Please provide an upload endpoint');

		const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		const uploadUrl = endpoint + `?uploadId=${uploadId}`;
		const progressUrl = endpoint.replace(/\/upload(\?.*)?$/, '/progress') + `?uploadId=${uploadId}`;

		setUploadProgress(0);

		try {
			setUploading(true);

			// start polling progress endpoint
			if (pollRef.current) {
				clearInterval(pollRef.current);
			}
			pollRef.current = setInterval(async () => {
				try {
					const r = await fetch(progressUrl);
					if (!r.ok) return;
					const info = await r.json().catch(() => null);
					if (info && typeof info.percent === 'number') {
						setUploadProgress(info.percent);
						if (info.done || info.percent === 100) {
							clearInterval(pollRef.current);
							pollRef.current = null;
						}
					}
				} catch (e) {
					console.warn('Progress poll error', e);
				}
			}, 500);

			// prepare form
			const form = new FormData();
			form.append('file', {
				uri: selectedFile.uri,
				name: selectedFile.name,
				type: 'application/octet-stream',
			});
			form.append('host', host);
			form.append('port', port);
			form.append('user', user);
			form.append('password', password);
			form.append('remotePath', remotePath);

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
				if (pollRef.current) {
					clearInterval(pollRef.current);
					pollRef.current = null;
				}
				setTimeout(() => setUploadProgress(0), 800);
			};
			xhrRef.current.onerror = () => {
				Alert.alert('Upload failed', 'Network error');
				setUploading(false);
				if (pollRef.current) {
					clearInterval(pollRef.current);
					pollRef.current = null;
				}
			};
			xhrRef.current.upload.onprogress = (ev) => {
				if (ev.lengthComputable) {
					const pct = Math.round((ev.loaded / ev.total) * 100);
					setUploadProgress(pct);
				}
			};
			xhrRef.current.send(form);
		} catch (err) {
			console.error('Upload error:', err);
			Alert.alert('Upload failed', err.message || String(err));
			setUploading(false);
			if (pollRef.current) {
				clearInterval(pollRef.current);
				pollRef.current = null;
			}
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
					placeholder="Upload Endpoint (e.g. http://192.168.1.x:4000/upload)"
					value={endpoint}
					onChangeText={setEndpoint}
					autoCapitalize="none"
				/>
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
				onPress={uploadViaEndpoint}
				disabled={uploading}
			>
				{uploading ? (
					<ActivityIndicator color="white" />
				) : (
					<Text style={styles.buttonText}>Upload To Endpoint</Text>
				)}
			</TouchableOpacity>

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
	progressContainer: {
		width: '90%',
		alignItems: 'center',
		marginTop: 8,
	},
	progressBackground: {
		width: '100%',
		height: 12,
		backgroundColor: '#eee',
		borderRadius: 6,
		overflow: 'hidden',
	},
	progressBar: {
		height: 12,
		backgroundColor: '#28a745',
	},
	progressText: {
		marginTop: 6,
		fontSize: 12,
		color: '#333',
	},
});
