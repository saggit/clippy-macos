import { useCallback, useEffect, useState } from "react";
import { clippyApi } from "../clippyApi";
import { useSharedState } from "../contexts/SharedStateContext";
import { DEFAULT_SYSTEM_PROMPT } from "../../sharedState";

export const SettingsParameters: React.FC = () => {
  const { settings } = useSharedState();
  const [tempSystemPrompt, setTempSystemPrompt] = useState(
    settings.systemPrompt,
  );
  const [tempTopK, setTempTopK] = useState(settings.topK);
  const [tempTemperature, setTempTemperature] = useState(settings.temperature);

  // Update settings on unmount so that the user editing preferences
  // doesn't rapidly reload the model
  useEffect(() => {
    return () => {
      const isNewSettings =
        tempSystemPrompt !== settings.systemPrompt ||
        tempTopK !== settings.topK ||
        tempTemperature !== settings.temperature;

      if (isNewSettings) {
        clippyApi.setState("settings", {
          ...settings,
          systemPrompt: tempSystemPrompt,
          topK: tempTopK,
          temperature: tempTemperature,
        });
      }
    };
  }, [tempSystemPrompt, tempTopK, tempTemperature]);

  const handleSystemPromptReset = useCallback(() => {
    const confirmed = window.confirm(
      "Are you sure you want to reset the system prompt to the default? This will overwrite any customizations you have made.",
    );

    if (confirmed) {
      setTempSystemPrompt(DEFAULT_SYSTEM_PROMPT);
    }
  }, []);

  return (
    <>
      <fieldset>
        <legend>Prompts</legend>
        <div className="field-row-stacked">
          <label htmlFor="systemPrompt">
            System Prompt. The key "[LIST OF ANIMATIONS]" will be automatically
            replaced by a full list of all available animations.
          </label>
          <textarea
            id="systemPrompt"
            rows={8}
            style={{ resize: "vertical" }}
            value={tempSystemPrompt}
            onChange={(e) => {
              setTempSystemPrompt(e.target.value);
            }}
          />
        </div>
        <div className="field-row-stacked">
          <button onClick={handleSystemPromptReset} style={{ width: 100 }}>
            Reset
          </button>
        </div>
      </fieldset>
      <fieldset style={{ marginTop: "20px" }}>
        <legend>Parameters</legend>
        <div className="field-row">
          <label htmlFor="topK">Top K</label>
          <input
            id="topK"
            type="number"
            value={tempTopK}
            step="0.1"
            onChange={(e) => setTempTopK(parseFloat(e.target.value))}
          />
        </div>
        <div className="field-row">
          <label htmlFor="temperature">Temperature</label>
          <input
            id="temperature"
            type="number"
            value={tempTemperature}
            step="0.1"
            onChange={(e) => setTempTemperature(parseFloat(e.target.value))}
          />
        </div>
      </fieldset>
    </>
  );
};
