type PathHandler = (req: Request) => Promise<Response>;

interface RouterPath {
  method: string;
  url: string;
  handler: PathHandler;
}

const getPathKey = (path: Omit<RouterPath, 'handler'>) => `${path.method}${path.url}`;

export const createRouter = (paths: RouterPath[]) => {
  const pathsMap = new Map<string, RouterPath['handler']>();
  paths.forEach(
    path => {
      pathsMap.set(getPathKey(path), path.handler);
    }
  );
  return (req: Request) => {
    const pathKey = getPathKey({
      method: req.method,
      url: new URL(req.url).pathname,
    });
    const pathHandler = pathsMap.get(pathKey);
    if (!pathHandler) {
      return new Response(
        'Not Found',
        { status: 404 },
      );
    }
    return pathHandler(req);
  };
};
