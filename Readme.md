RISCV Visual Simulator (Single Cycle)

A javascript based RISCV simulator. 

To run on dev mode, run the following command
```bash
 cd app
 pnpm install
 pnpm run dev 
>>>>>>> 82827a3 (Add README.md with setup instructions for RISCV Visual Simulator)
```

To deply the app, run the following command
```bash
 docker build -t riscvsim .
 docker run -d -it -p 80:3000 --restart unless-stopped --name riscvsim-app riscvsim
