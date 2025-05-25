import { clippyApi } from "../clippyApi";
import { useSharedState } from "../contexts/SharedStateContext";

interface ErrorLoadModelMessageContentProps {
  error: string;
}

export const ErrorLoadModelMessageContent: React.FC<
  ErrorLoadModelMessageContentProps
> = ({ error }) => {
  const { settings } = useSharedState();

  const handleCopyDebugInfo = async () => {
    clippyApi.clipboardWrite({
      text: JSON.stringify(
        {
          error,
          settings,
          state: await clippyApi.getDebugInfo(),
        },
        null,
        2,
      ),
    });
  };

  return (
    <div>
      <p>
        Sadly, Clippy failed to successfully load the model. This could be an
        issue with Clippy itself, the selected model, or your system. You can
        report this error at{" "}
        <a
          href="https://github.com/felixrieseberg/clippy/issues"
          target="_blank"
        >
          github.com/felixrieseberg/clippy/issues
        </a>
        . Please include both the error message and the debug information.
      </p>
      <button onClick={handleCopyDebugInfo}>Copy error and debug info</button>
      <p>The error was:</p>
      <pre>{`${error}`}</pre>
    </div>
  );
};
