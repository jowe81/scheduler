import { useState } from "react";

export default function useVisualMode(initial) {
  const [mode, setMode] = useState(initial);
  const [history, setHistory] = useState([initial]);

  const transition = (newMode, replace = false) => {
    //Update the history (append new mode)
    const newHistory = [ ...history ];
    //If replace is truthy, swap out the last mode instead of adding newMode to the end
    if (replace) {
      newHistory.pop();
    }
    newHistory.push(newMode);
    setHistory(newHistory);

    setMode(newMode);
  }

  const back = () => {
    //Only go back if there is a history beyond the initial mode
    if (history.length > 1) {
      //Remove the latest entry (current) mode
      const historyCopy = [...history];
      historyCopy.pop();
      //Obtain the previous mode (now the last entry in the array)
      const previousMode = historyCopy[historyCopy.length - 1];

      setHistory([...historyCopy]);
      setMode(previousMode);
    }
  }

  return { mode, transition, back };
}

