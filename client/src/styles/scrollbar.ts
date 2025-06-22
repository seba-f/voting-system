import { SxProps } from "@mui/material";

export const scrollbarStyle: SxProps = {
    "&::-webkit-scrollbar": {
        width: "8px",
        height: "8px",
    },
    "&::-webkit-scrollbar-track": {
        backgroundColor: "rgba(0, 0, 0, 0.05)",
    },
    "&::-webkit-scrollbar-thumb": {
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        borderRadius: "8px",
        "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.3)",
        }
    },
    overflowY: "auto",
    height: "100%",
    scrollbarWidth: "thin",
};

export const contentContainerStyle: SxProps = {
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 112px)", // Subtracting header height and padding
    overflow: "hidden",
};

export const scrollableContentStyle: SxProps = {
    ...scrollbarStyle,
    flex: 1,
    padding: 2,
    paddingTop: 0,
};
