export type ProgressProps = {
  progress: number;
};

export const Progress: React.FC<ProgressProps> = ({ progress }) => {
  return (
    <div className="progress-indicator segmented">
      <span
        className="progress-indicator-bar"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
