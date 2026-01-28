import { View, TouchableOpacity, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { selectIsDarkTheme } from '../store/themeSlice';
import getStyles from './Nav.styles';

export default function Nav({ currentTab, onTabChange }) {
	const isDarkTheme = useSelector(selectIsDarkTheme);
	const styles = getStyles(isDarkTheme);
	const tabs = [
		{ id: 'firmware', label: 'Firmware' },
		{ id: 'pumps', label: 'Pumps' },
	];

	return (
		<View style={styles.navContainer}>
			{tabs.map((tab) => (
				<TouchableOpacity
					key={tab.id}
					style={[
						styles.navButton,
						currentTab === tab.id && {
							backgroundColor: isDarkTheme ? '#8ab4f8' : '#007AFF',
						},
					]}
					onPress={() => onTabChange(tab.id)}
				>
					<Text
						style={[
							styles.navText,
							currentTab === tab.id && { color: isDarkTheme ? '#202124' : '#fff' },
						]}
					>
						{tab.label}
					</Text>
				</TouchableOpacity>
			))}
		</View>
	);
}
