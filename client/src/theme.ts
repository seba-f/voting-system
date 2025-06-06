import { createTheme } from '@mui/material/styles';


// Light theme
export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#17B890',
            light: '#45c6a6',
            dark: '#108064',
        },
        secondary: {
            main: '#5E807F',
            light: '#7e9998',
            dark: '#415958',
        },
        background: {
            default: '#FBFCFF',
            paper: '#ffffff',
        },
        error:{
            main:'#B02E0C',
            light:'#bf573c',
            dark:'#7b2008'
        },
        warning:{
            main:'#E3D26F',
            light:'#e8db8b',
            dark:'#9e934d'
        },
        info:{
            main:'#2F3061',
            light:'#585980',
            dark:'#202143'
        },
        success:{
            main:'#0B5D1E',
            light:'#3b7d4b',
            dark:'#074115'
        }
    },
});

// Dark theme
export const darkTheme = createTheme({
    palette: {
    mode: 'dark',
    primary: {
        main: '#17B890',
        light: '#45c6a6',
        dark: '#108064',
    },
    secondary: {
        main: '#5E807F',
        light: '#7e9998',
        dark: '#415958',
    },
    background: {
        default: '#121212',
        paper: '#1E1E1E',
    },
    error: {
        main: '#FF6F61',
        light: '#FF8A75',
        dark: '#B24C43'
    },
    warning: {
        main: '#E3D26F',
        light: '#e8db8b',
        dark: '#9e934d'
    },
    info: {
        main: '#8DA9C4',
        light: '#A8BCD3',
        dark: '#617C99'
    },
    success: {
        main: '#45B36B',
        light: '#6CCB8A',
        dark: '#2E804D'
    }
}

});