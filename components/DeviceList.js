import { Text, View, TouchableOpacity, Image, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { selectIsDarkTheme } from '../store/themeSlice';
import getStyles from './DeviceList.styles';

export default function DeviceList({ devices = [], onSelect = () => {} }) {
	const isDarkTheme = useSelector(selectIsDarkTheme);
	const styles = getStyles(isDarkTheme);

	const sampleDevices = [
		{
			model: 'ABC-100',
			ip: '192.168.1.10',
			image: 'https://via.placeholder.com/64.png?text=DEV1',
		},
		{
			model: 'XYZ-200',
			ip: '192.168.1.11',
			image: 'https://via.placeholder.com/64.png?text=DEV2',
		},
		{
			model: 'LMN-300',
			ip: '192.168.1.12',
			image: 'https://via.placeholder.com/64.png?text=DEV3',
		},
	];

	const renderItem = ({ item }) => {
		const { model = 'Unknown', ip = '0.0.0.0', image } = item;
		const imageSource = image ? { uri: image } : { uri: 'https://via.placeholder.com/64.png' };

		return (
			<TouchableOpacity style={styles.card} onPress={() => onSelect(item)}>
				<Image source={imageSource} style={styles.thumb} resizeMode="contain" />
				<View style={styles.info}>
					<Text style={styles.label} numberOfLines={1}>
						Model Number: <Text style={styles.value}>{model}</Text>
					</Text>
					<Text style={styles.label} numberOfLines={1}>
						IP Address: <Text style={styles.value}>{ip}</Text>
					</Text>
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<View style={styles.card}>
			<FlatList
				data={devices}
				keyExtractor={(item, idx) => (item.ip ? `${item.ip}-${idx}` : String(idx))}
				renderItem={renderItem}
				contentContainerStyle={styles.list}
				ListEmptyComponent={() => (
					<View style={styles.empty}>
						<Text style={styles.emptyText}>No devices found — example devices:</Text>
						{sampleDevices.map((d, i) => (
							<View key={i} style={styles.cardSmall}>
								<Image source={{ uri: d.image }} style={styles.thumbSmall} />
								<View style={styles.infoSmall}>
									<Text style={styles.labelSmall}>
										Model Number: <Text style={styles.value}>{d.model}</Text>
									</Text>
									<Text style={styles.labelSmall}>
										IP Address: <Text style={styles.value}>{d.ip}</Text>
									</Text>
								</View>
							</View>
						))}
					</View>
				)}
			/>
		</View>
	);
}
