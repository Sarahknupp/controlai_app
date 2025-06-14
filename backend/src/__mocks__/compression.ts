const compression = jest.fn(() => {
  return (req: any, res: any, next: any) => {
    next();
  };
});

export default compression; 