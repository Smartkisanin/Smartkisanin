import app from './app';

const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid PORT value: "${process.env.PORT}"`);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Smart Kisan Bharat API listening on 0.0.0.0:${port}`);
});
