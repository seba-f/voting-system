declare module '*.png' {
    const value: string;
    export default value;
}

declare module '*.jpg' {
    const value: string;
    export default value;
}

declare module '*.jpeg' {
    const value: string;
    export default value;
}

declare module '*.svg' {
    const content: string;
    export default content;
}

declare module '*.gif' {
    const value: string;
    export default value;
}

interface Window {
    electron: {
        onSetSessionDuration: (callback: (minutes: number) => void) => void;
        minimize: () => void;
        maximize: () => void;
        close: () => void;
    }
    sessionUtils: {
        setTestDuration: (minutes: number) => {
            cleanup: () => void;
            config: {
                sessionDurationMinutes: number;
                warningBeforeMinutes: number;
            };
        };
        resetToDefault: () => {
            sessionDurationMinutes: number;
            warningBeforeMinutes: number;
        };
        getConfig: () => {
            sessionDuration: string;
            warningTime: string;
            rawConfig: {
                sessionDurationMinutes: number;
                warningBeforeMinutes: number;
            };
        };
    };
}