import React, { useState } from "react";
import {
	HashRouter as Router,
	Routes,
	Route,
	Navigate,
	Outlet,
} from "react-router-dom";
import { ThemeProvider, CssBaseline, Box, useTheme } from "@mui/material";
import { lightTheme, darkTheme } from "./theme";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AlertProvider } from "./components/AlertContext";
import { LoginPage } from "./pages/LoginPage";
import { Dashboard } from "./pages/Dashboard";
import { Navbar } from "./components/Navbar";
import { UsersList } from "./pages/admin/UsersList";
import { NewUserPage } from "./pages/admin/NewUserPage";

interface AppLayoutProps {
	isDarkMode: boolean;
	onThemeToggle: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ isDarkMode, onThemeToggle }) => {
	const theme = useTheme();
	return (
		<Box sx={{ display: "flex" }}>
			<Navbar onThemeToggle={onThemeToggle} isDarkMode={isDarkMode} />
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					width: {
						xs: `calc(100% - ${64}px)`, // DRAWER_WIDTH_MINIMAL
						md: `calc(100% - ${240}px)`, // DRAWER_WIDTH
					},
					p: 3,
					transition: theme.transitions.create(["margin", "width"], {
						easing: theme.transitions.easing.sharp,
						duration: theme.transitions.duration.enteringScreen,
					}),
				}}
			>
				<Outlet />
			</Box>
		</Box>
	);
};

const App: React.FC = () => {
	const [isDarkMode, setIsDarkMode] = useState(false);

	const toggleTheme = () => {
		setIsDarkMode(!isDarkMode);
	};

	return (
		<ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
			<CssBaseline />
			<AlertProvider>
				<AuthProvider>
					<Router>
						<Routes>
							{/* Public route - no navbar */}
							<Route path="/login" element={<LoginPage />} />

							{/* Protected routes - with navbar */}
							<Route
								element={
									<ProtectedRoute>
										<AppLayout
											isDarkMode={isDarkMode}
											onThemeToggle={toggleTheme}
										/>
									</ProtectedRoute>
								}
							>
								<Route index element={<Navigate to="/dashboard" replace />} />
								<Route path="/dashboard" element={<Dashboard />} />
								<Route
									path="/admin/*"
									element={
										<ProtectedRoute requireAdmin>
											{" "}
											<Routes>
												<Route path="users" element={<UsersList />} />
												<Route path="users/new" element={<NewUserPage />} />
											</Routes>
										</ProtectedRoute>
									}
								/>
							</Route>
						</Routes>
					</Router>{" "}
				</AuthProvider>
			</AlertProvider>
		</ThemeProvider>
	);
};

export default App;
