# Fictures

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
<a href="http://www.repostatus.org/#active"><img src="http://www.repostatus.org/badges/latest/active.svg" /></a>
[![Next.js](https://img.shields.io/badge/built_with-Next.js-0070f3)](https://nextjs.org/)

Generative image NFT service platform.

## About

Generative image consists of image and prompt data. This platform transform image and prompt data to NFT. After publishing NFT, prompt will be stored with the form of encryption.

## Getting Started

#### Clone git repository

```bash
git clone https://github.com/realbits-lab/prompt-nft.git
```

#### Install packages

```bash
yarn install
```

#### Start development server

```bash
yarn dev
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

#### Migrate prisma

In case of heroku cloud, heroku would not support shadow database, so you should install and run local postgres database for shadow.

```bash
npx prisma migrate dev --name init
```
