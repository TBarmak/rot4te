import React, { createContext, useContext, useRef, useEffect } from "react";
import { Audio } from "expo-av";

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
    const backgroundAudio = useRef(new Audio.Sound());

    useEffect(() => {
        async function loadAudio() {
            try {
                await backgroundAudio.current.loadAsync(require("../assets/background.wav"), { isLooping: true });
                await backgroundAudio.current.playAsync();
            } catch (err) {
                console.log("Error loading audio:", err);
            }
        }
        loadAudio();

        return () => {
            backgroundAudio.current.unloadAsync();
        };
    }, []);

    return (
        <AudioContext.Provider value={{ backgroundAudio }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => useContext(AudioContext);
