# Fictures

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)

Generative image NFT service platform.

## About

Generative image consists of image and prompt data. This platform transform image and prompt data to NFT. After publishing NFT, prompt will be stored with the form of encryption.

<details open>
   <summary>
      <h3>
         💻 Installation
      </h3>
   </summary>

#### Clone git repository

```bash
git clone https://github.com/realbits-lab/prompt-nft.git
```

#### Migrate prisma

In case of heroku cloud, heroku would not support shadow database, so you should install and run local postgres database for shadow.

```bash
npx prisma migrate dev --name init
```

</details>
