import { SxProps } from "@mui/material";

export const scrollbarStyle: SxProps = {
    "&::-webkit-scrollbar": {
        width: "8px",
        height: "8px",
    },
    "&::-webkit-scrollbar-track": {
        backgroundColor: "action.hover",
    },
    "&::-webkit-scrollbar-thumb": {
        backgroundColor: "primary.light",
        borderRadius: "8px",
        "&:hover": {
            backgroundColor: "primary.main",
        }
    },
    overflowY: "auto",
    height: "100%",
    scrollbarWidth: "thin",
};

export const contentContainerStyle: SxProps = {
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 80px)", // Subtracting header height and padding
    overflow: "hidden",
};

export const scrollableContentStyle: SxProps = {
    ...scrollbarStyle,
    flex: 1,
    padding: 2,
    paddingTop: 0,
};
