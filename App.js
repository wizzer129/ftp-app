import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import FirmwarePage from './views/FirmwarePage';
import PumpsView from './views/PumpsView';
import Nav from './components/Nav';
import TopBar from './components/TopBar';
import getStyles from './App.styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { Provider, useSelector, useDispatch } from 'react-redux';
import store from './store';
import {
	setDarkTheme,
	toggleTheme as toggleThemeAction,
	selectIsDarkTheme,
} from './store/themeSlice';

function AppContent() {
	const [currentTab, setCurrentTab] = useState('firmware');
	const dispatch = useDispatch();
	const isDarkTheme = useSelector(selectIsDarkTheme);

	useEffect(() => {
		loadThemePreference();
	}, []);

	const styles = getStyles(isDarkTheme);

	const loadThemePreference = async () => {
		try {
			const savedTheme = await AsyncStorage.getItem('isDarkTheme');
			if (savedTheme !== null) {
				dispatch(setDarkTheme(JSON.parse(savedTheme)));
			} else {
				// no saved preference — use system color scheme
				const sys = Appearance.getColorScheme();
				dispatch(setDarkTheme(sys === 'dark'));
			}
		} catch (error) {
			console.error('Failed to load theme preference:', error);
		}
	};

	const toggleTheme = async () => {
		try {
			dispatch(toggleThemeAction());
			const newTheme = !isDarkTheme;
			await AsyncStorage.setItem('isDarkTheme', JSON.stringify(newTheme));
		} catch (error) {
			console.error('Failed to save theme preference:', error);
		}
	};

	const renderContent = () => {
		switch (currentTab) {
			case 'firmware':
				return <FirmwarePage />;
			case 'pumps':
				return <PumpsView />;
			default:
				return <FirmwarePage />;
		}
	};

	const getPageTitle = () => {
		switch (currentTab) {
			case 'firmware':
				return 'Firmware';
			case 'pumps':
				return 'Pumps';
			default:
				return 'Firmware';
		}
	};

	return (
		<View style={styles.container}>
			<TopBar title={getPageTitle()} onToggleTheme={toggleTheme} />
			<View style={styles.content}>{renderContent()}</View>
			<Nav currentTab={currentTab} onTabChange={setCurrentTab} />
		</View>
	);
}

export default function App() {
	return (
		<Provider store={store}>
			<AppContent />
		</Provider>
	);
}
