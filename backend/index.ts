import { type Serve } from "bun";
import { createRouter } from './router';
import { submitScore } from './routes/submitScore';

const router = createRouter([{
  method: 'POST',
  url: '/submitScore',
  handler: submitScore,
}]);

export default {
  async fetch(req: Request) {
    return await router(req);
  },
  development: process.env.NODE_ENV !== "production",
  port: 3000,
} satisfies Serve;
