### Use prisma

- npx prisma migrate dev --name init

### metamask auth

- [One-click Login with Blockchain: A MetaMask Tutorial](https://www.toptal.com/ethereum/one-click-login-flows-a-metamask-tutorial)

### nextjs and mui

- [Getting started with MUI and Next.js](https://blog.logrocket.com/getting-started-with-mui-and-next-js/)
- [Next.js + MUI v5 + Typescript tutorial and starter](https://dev.to/hajhosein/nextjs-mui-v5-typescript-tutorial-and-starter-3pab)

### Get PostgreSql info

- heroku pg:info

### Remove postgresql pool

- select \* from pg_stat_activity where usename='[username]';
- select pg_cancel_backend(pid) from pg_stat_activity where usename='[username]';
- select pg_terminate_backend(pid) from pg_stat_activity where usename='[username]';

### PostgreSql connection pool on heroku

- https://devcenter.heroku.com/articles/postgres-connection-pooling

### Custom domain in heroku

- https://devcenter.heroku.com/articles/custom-domains
