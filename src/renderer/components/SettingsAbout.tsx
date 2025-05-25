import { useEffect, useState } from "react";
import { Versions } from "../../types/interfaces";
import { clippyApi } from "../clippyApi";

export const SettingsAbout: React.FC = () => {
  const [versions, setVersions] = useState<Partial<Versions>>({});

  useEffect(() => {
    clippyApi.getVersions().then((versions) => {
      setVersions(versions);
    });
  }, []);

  return (
    <div>
      <h1>About</h1>
      <fieldset>
        <legend>Version</legend>
        <p>
          Clippy <code>{versions.clippy || "Unknown"}</code> (with Electron{" "}
          <code>{versions.electron || "Unknown"}</code> and Node-llama-cpp:{" "}
          <code>{versions.nodeLlamaCpp || "Unknown"})</code>
        </p>
      </fieldset>
      <p>
        This app is a love letter and homage to the late, great Clippy, the
        assistant from Microsoft Office 1997. It is <i>not</i> affiliated,
        approved, or supported by Microsoft. Consider it software art. If you
        don't like it, consider it software satire.
      </p>
      <h3>Acknowledgments</h3>
      <p>
        This app was made by{" "}
        <a href="https://github.com/felixrieseberg" target="_blank">
          Felix Rieseberg
        </a>{" "}
        using{" "}
        <a href="https://electronjs.org/" target="_blank">
          Electron
        </a>{" "}
        and{" "}
        <a href="https://node-llama-cpp.withcat.ai/" target="_blank">
          node-llama-cpp
        </a>
        , embedded using{" "}
        <a href="https://github.com/electron/llm" target="_blank">
          @electron/llm
        </a>
        . The whimsical retro design was made possible by{" "}
        <a href="https://github.com/jdan" target="_blank">
          Jordan Scales
        </a>
        . Quantized GGUF models provided by{" "}
        <a href="https://www.unsloth.ai" target="_blank">
          Unsloth
        </a>
        .
      </p>
      <p>
        The character was designed by illustrator{" "}
        <a href="https://www.kevanatteberry.com/" target="_blank">
          Kevan Atteberry
        </a>
        , who created more than 15 potential characters for Microsoft's Office
        Assistants. "He's a guy that just wants to help, and he's a little bit
        too helpful sometimes — and there's something fun and vulnerable about
        that.", he once said about Clippy.
      </p>
      <p>
        Clippy and all visual assets related to Clippy are owned by Microsoft.
        This app is not affiliated with Microsoft.
      </p>
    </div>
  );
};
