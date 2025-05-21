import { createTheme, PaletteOptions } from "@mui/material";

const lightPalette: PaletteOptions={
    mode:'light',
    primary:{
        main:'#011627',
        light:'#334452',
        dark: '#000f1b',
    },
    secondary:{
        main:'#2EC4B6',
        light:'#57cfc4',
        dark: '#20897f'
    },
    background:{
        default:'#FDFFFC',
        paper: '#FCFFFB'
    },
    error:{
        main:"#6A041D",
        light:"#87364a",
        dark:"#4a0214"
    },
    warning:{
        main:"#D17A22",
        light:"#da944e",
        dark:"#925517"
    },
    info:{
        main:"#5688C7",
        light:"#779fd2",
        dark:"#3c5f8b"
    },
    success:{
        main:"#386641",
        light:"#5f8467",
        dark:"#27472d"
    }
}

const darkPalette: PaletteOptions = {
    mode: 'dark',
    primary: {
        main: '#7FBFFF',
        light: '#A7D2FF',
        dark: '#4A8FC4'   
    },
    secondary: {
        main: '#2EC4B6',
        light: '#65E0D4',
        dark: '#20897f'
    },
    background: {
        default: '#121212',
        paper: '#1E1E1E'
    },
    error: {
        main: '#F46A8C',
        light: '#F88CA1',
        dark: '#B93C5A'
    },
    warning: {
        main: '#FFB74D',
        light: '#FFD59A',
        dark: '#C88719'
    },
    info: {
        main: '#90CAF9',
        light: '#BBDEFB',
        dark: '#5C8BC0'
    },
    success: {
        main: '#81C784',   
        light: '#A5D6A7',
        dark: '#519657'
    }
};
