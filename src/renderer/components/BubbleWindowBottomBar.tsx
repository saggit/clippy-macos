export const BubbleWindowBottomBar: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        marginLeft: "8px",
        marginRight: "8px",
      }}
    >
      {children}
    </div>
  );
};
