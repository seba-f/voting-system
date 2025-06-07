import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { 
    Box, 
    Button, 
    Drawer, 
    useTheme, 
    useMediaQuery,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Collapse
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import logoFull from '../assets/logo_full.svg';
import logoCheck from '../assets/logo_check.svg';

interface NavbarProps {
    onThemeToggle: () => void;
    isDarkMode: boolean;
}

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_MINIMAL = 64;

export const Navbar: React.FC<NavbarProps> = ({ onThemeToggle, isDarkMode }) => {
    const [profileOpen, setProfileOpen] = useState(false);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMinimal = useMediaQuery(theme.breakpoints.down('md'));
    const { user, logout, isAdmin } = useAuth();

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const buttonSx = {
        justifyContent: isMinimal ? 'center' : 'flex-start',
        minWidth: 0,
        px: isMinimal ? 0 : 2,
        '& .MuiButton-startIcon': {
            margin: isMinimal ? 'auto' : undefined,
            color:theme.palette.primary.main
        },
        pt:2,
        pb:2,
        m:0
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: isMinimal ? DRAWER_WIDTH_MINIMAL : DRAWER_WIDTH,
                '& .MuiDrawer-paper': {
                    width: isMinimal ? DRAWER_WIDTH_MINIMAL : DRAWER_WIDTH,
                    boxSizing: 'border-box',
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    overflowX: 'hidden',
                }
            }}
        >
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                p: 0,
            }}>
                {/* Logo */}
                <Box sx={{ 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 1,
                    py: 2
                }} 
                onClick={() => handleNavigation('/dashboard')}>
                    <img 
                        src={isMinimal ? logoCheck : logoFull} 
                        alt="Logo" 
                        style={{ 
                            height: '40px',
                            width: 'auto',
                        }} 
                    />
                </Box>

                {/* Navigation Buttons */}
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: 0
                }}>
                    <Button 
                        color="inherit" 
                        onClick={() => handleNavigation('/dashboard')}
                        startIcon={<DashboardIcon />}
                        sx={buttonSx}
                    >
                        {!isMinimal && 'Dashboard'}
                    </Button>

                    {isAdmin() && (
                        <>
                            <Button 
                                color="inherit" 
                                onClick={() => handleNavigation('/admin/users')}
                                startIcon={<PeopleIcon />}
                                sx={buttonSx}
                            >
                                {!isMinimal && 'Manage Users'}
                            </Button>
                            <Button 
                                color="inherit" 
                                onClick={() => handleNavigation('/admin/elections')}
                                startIcon={<HowToVoteIcon />}
                                sx={buttonSx}
                            >
                                {!isMinimal && 'Manage Elections'}
                            </Button>
                        </>
                    )}
                </Box>

                {/* Bottom Section */}
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    mt:'auto',
                    p: 1
                }}>
                    <Divider sx={{ my: 1 , backgroundColor:theme.palette.secondary.main}} />
                    
                    {/* Profile Button with Collapse */}
                    <Collapse in={profileOpen} timeout="auto" unmountOnExit>
                        <Button 
                            color="inherit"
                            onClick={handleLogout}
                            startIcon={<ExitToAppIcon />}
                            sx={{
                                ...buttonSx,
                                width: '100%'
                            }}
                        >
                            {!isMinimal && 'Logout'}
                        </Button>
                    </Collapse>
                    <Button
                        color="inherit"
                        onClick={() => setProfileOpen(!profileOpen)}
                        startIcon={<AccountCircleIcon />}
                        endIcon={!isMinimal && (profileOpen ? <ExpandLess /> : <ExpandMore />)}
                        sx={buttonSx}
                    >
                        {!isMinimal && (user?.username || 'Profile')}
                    </Button>

                    {/* Theme Toggle Button */}
                    <Button
                        color="inherit"
                        onClick={onThemeToggle}
                        startIcon={isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                        sx={buttonSx}
                    >
                        {!isMinimal && (isDarkMode ? 'Light Mode' : 'Dark Mode')}
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
};