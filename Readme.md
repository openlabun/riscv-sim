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
 docker build -t riscvsim .
 docker run -d -it -p 80:3000 --restart unless-stopped --name riscvsim-app riscvsim
