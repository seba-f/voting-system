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
import { UsersList } from "./pages/admin/ManageUsers";
import { NewUserPage } from "./pages/admin/NewUserPage";
import { CategoriesList } from "./pages/admin/ManageCategories";
import { BallotsList } from "./pages/BallotsList";
import { CreateBallot } from "./pages/admin/CreateBallot";
import ViewBallotAdmin from "./pages/admin/ViewBallotAdmin";
import ViewBallot from "./pages/ViewBallot";
import TitleBar from "./components/TitleBar";

interface AppLayoutProps {
	isDarkMode: boolean;
	onThemeToggle: () => void;
}

// main application layout with navigation and theme controls
const AppLayout: React.FC<AppLayoutProps> = ({ isDarkMode, onThemeToggle }) => {
    const theme = useTheme();
    return (        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            <TitleBar />
            <Box sx={{ display: "flex", flex: 1 }}>
                <Navbar onThemeToggle={onThemeToggle} isDarkMode={isDarkMode} />
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        width: {
                            xs: `calc(100% - ${64}px)`,
                            md: `calc(100% - ${240}px)`,
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
        </Box>
    );
};

// root application component with theme and routing setup
const App: React.FC = () => {
    // Read theme preference from localStorage, default to false (light)
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const stored = localStorage.getItem("theme");
        return stored === "dark";
    });

    const toggleTheme = () => {
        setIsDarkMode((prev) => {
            const next = !prev;
            localStorage.setItem("theme", next ? "dark" : "light");
            return next;
        });
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
                                <Route path="/ballot/:id" element={<ViewBallot />} />
                                <Route path="/ballots" element={<BallotsList />} />
                                <Route
                                    path="/admin/*"
                                    element={
                                        <ProtectedRoute requireAdmin>
                                            <Routes>
                                                <Route path="users" element={<UsersList />} />
                                                <Route path="users/new" element={<NewUserPage />} />
                                                <Route path="categories" element={<CategoriesList />} />
                                                <Route path="ballots" element={<BallotsList />} />
                                                <Route path="ballots/new" element={<CreateBallot />} />
                                                <Route path="ballot/:id" element={<ViewBallotAdmin />} />
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
