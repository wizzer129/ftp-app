import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsDarkTheme } from '../store/themeSlice';
import { setSelectedPump, selectSelectedPump } from '../store/pumpSlice';
import getStyles from './PumpCard.styles';

export default function PumpCard({ pump }) {
	const isDarkTheme = useSelector(selectIsDarkTheme);
	const styles = getStyles(isDarkTheme);
	const dispatch = useDispatch();
	const selectedPump = useSelector(selectSelectedPump);

	const isSelected = selectedPump && pump.ip === selectedPump.ip;

	const cardStyle = {
		...styles.card,
		...(isSelected ? styles.selectedCard : {}),
	};

	const onPress = () => {
		dispatch(setSelectedPump(pump));
	};

	return (
		<TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.8}>
			<Image source={pump.image} style={styles.image} />
			<View style={styles.info}>
				<Text style={styles.name}>{pump.name}</Text>
				<Text style={styles.ip}>{pump.ip}</Text>
			</View>
		</TouchableOpacity>
	);
}
