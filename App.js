import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import FirmwarePage from './views/FirmwarePage';
import Nav from './components/Nav';
import TopBar from './components/TopBar';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
	const [currentTab, setCurrentTab] = useState('firmware');
	const [isDarkTheme, setIsDarkTheme] = useState(true);

	useEffect(() => {
		loadThemePreference();
	}, []);

	const loadThemePreference = async () => {
		try {
			const savedTheme = await AsyncStorage.getItem('isDarkTheme');
			if (savedTheme !== null) {
				setIsDarkTheme(JSON.parse(savedTheme));
			}
		} catch (error) {
			console.error('Failed to load theme preference:', error);
		}
	};

	const toggleTheme = async () => {
		const newTheme = !isDarkTheme;
		setIsDarkTheme(newTheme);
		try {
			await AsyncStorage.setItem('isDarkTheme', JSON.stringify(newTheme));
		} catch (error) {
			console.error('Failed to save theme preference:', error);
		}
	};

	const renderContent = () => {
		switch (currentTab) {
			case 'firmware':
				return <FirmwarePage isDarkTheme={isDarkTheme} />;
			case 'settings':
				return (
					<View
						style={[
							styles.placeholder,
							{ backgroundColor: isDarkTheme ? '#202124' : '#f5f5f5' },
						]}
					/>
				);
			default:
				return <FirmwarePage isDarkTheme={isDarkTheme} />;
		}
	};

	const getPageTitle = () => {
		switch (currentTab) {
			case 'firmware':
				return 'Firmware';
			case 'settings':
				return 'Settings';
			default:
				return 'Firmware';
		}
	};

	return (
		<View style={[styles.container, { backgroundColor: isDarkTheme ? '#202124' : '#f5f5f5' }]}>
			<TopBar title={getPageTitle()} isDarkTheme={isDarkTheme} onToggleTheme={toggleTheme} />
			<View style={styles.content}>{renderContent()}</View>
			<Nav currentTab={currentTab} onTabChange={setCurrentTab} isDarkTheme={isDarkTheme} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#202124',
	},
	content: {
		flex: 1,
	},
	placeholder: {
		flex: 1,
		backgroundColor: '#202124',
	},
});
