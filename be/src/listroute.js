import routeAPI from './routes/api.js';

routeAPI.stack.forEach((middleware) => {
  if (middleware.route) {
    const methods = Object.keys(middleware.route.methods).map(m => m.toUpperCase()).join(', ');
    console.log(`${methods}\t${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    middleware.handle.stack.forEach((handler) => {
      const route = handler.route;
      if (route) {
        const methods = Object.keys(route.methods).map(m => m.toUpperCase()).join(', ');
        console.log(`${methods}\t${route.path}`);
      }
    });
  }
});
