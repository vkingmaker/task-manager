/* eslint-disable no-console */
import app from './app';

    const { PORT } = process.env;

app.listen(PORT, () => {
  console.log(`server is up and running at ${PORT}`);
});
