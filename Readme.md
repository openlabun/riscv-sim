RISCV Visual Simulator

A javascript based RISCV simulator. 

To run on dev mode, run the following command
```bash
 cd app
 pnpm install
 pnpm run dev 
```


To deply the app, run the following command
```bash
 docker build -t riscvsimi .
 docker run -d -it -p 5034:3000 --restart unless-stopped --name riscvsim riscvsimi
