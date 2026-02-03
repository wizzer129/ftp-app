import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { selectIsDarkTheme } from '../store/themeSlice';
import getStyles from './PumpsView.styles';
import PumpCard from '../components/PumpCard';
import { selectSelectedPump } from '../store/pumpSlice';
import A3 from '../assets/pumps/A3.png';
import A4 from '../assets/pumps/A4.png';
import A5 from '../assets/pumps/A5.png';
import M3 from '../assets/pumps/M3.png';
import M4 from '../assets/pumps/M4.png';
import M5 from '../assets/pumps/M5.png';
// import { startScanning, stopScanning, getDevices } from '../services/ScanDevices';
import { useWhoAmIScanner } from '../services/scanWhoAmI';

export default function PumpsView() {
	const isDarkTheme = useSelector(selectIsDarkTheme);
	const styles = getStyles(isDarkTheme);
	const pump = {
		name: 'Pump A',
		ip: '192.168.1.50',
		image: A3,
	};

	const selectedPump = useSelector(selectSelectedPump);
	// Placeholder pump data (multiple items for scroll)
	const pumps = [
		{ name: 'Pump A', ip: '192.168.1.50', image: A3 },
		{ name: 'Pump B', ip: '192.168.1.51', image: A4 },
		{ name: 'Pump C', ip: '192.168.1.52', image: A5 },
		{ name: 'Pump D', ip: '192.168.1.53', image: M3 },
		{ name: 'Pump E', ip: '192.168.1.54', image: M4 },
		{ name: 'Pump F', ip: '192.168.1.55', image: M5 },
	];
	const { scanning, results, start, stop } = useWhoAmIScanner();

	const discovered = results.map((r) => ({
		name: (r.info && (r.info.name || r.info.id)) || `${r.host}:${r.port}`,
		ip: r.host,
		key: `${r.host}:${r.port}`,
	}));

	// startScanning((devices) => {
	// 	console.log('Found devices:', devices);
	// });

	return (
		<View style={styles.container}>
			<View style={styles.card}>
				<TouchableOpacity
					style={styles.scanPill}
					onPress={() => {
						if (scanning) stop();
						else start();
					}}
				>
					<Text style={styles.scanText}>{scanning ? 'Stop' : 'Scan'}</Text>
				</TouchableOpacity>
			</View>

			<Text style={styles.label}>Selected Pump</Text>
			<PumpCard pump={selectedPump || pump} />
			<Text style={{ ...styles.label, marginTop: 12 }}>Available Pumps</Text>
			<FlatList
				data={pumps}
				style={styles.pumpList}
				keyExtractor={(item) => item.ip || item.name}
				contentContainerStyle={{ paddingBottom: 24 }}
				renderItem={({ item }) => <PumpCard pump={item} />}
			/>

			{discovered.length > 0 && (
				<>
					<Text style={{ ...styles.label, marginTop: 12 }}>Discovered Devices</Text>
					<FlatList
						data={discovered}
						style={styles.pumpList}
						keyExtractor={(item) => item.key}
						contentContainerStyle={{ paddingBottom: 24 }}
						renderItem={({ item }) => <PumpCard pump={item} />}
					/>
				</>
			)}
		</View>
	);
}
