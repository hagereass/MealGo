
  # Responsive Food Delivery Website (Copy) (Copy)

  This is a code bundle for Responsive Food Delivery Website (Copy) (Copy). The original project is available at https://www.figma.com/design/QmXPCtk9T1nSLZzXM0vY2b/Responsive-Food-Delivery-Website--Copy---Copy-.

  ## Running the code

  1. **Install dependencies**
     ```bash
     npm install          # at the project root
     cd server && npm install    # install server-specific packages
     ```

  2. **Prepare environment**
     - Copy `.env.example` to `.env` and fill in the values.
     - Required variables:
       - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
       - `API_PORT`, `VITE_PORT`
       - `PRIVATE_KEY` & `RPC_URL` (for blockchain)

  3. **Initialize the database**
     ```bash
     # create the database and load schema+seed/views
     createdb -U postgres mealgo_db          # adjust user/name if needed
     psql -U postgres -d mealgo_db -f database/init.sql
     ```
     > Alternatively, run the ALTER TABLE commands if the schema already exists:
     > ```sql
     > ALTER TABLE coupons
     >   ADD COLUMN IF NOT EXISTS nft_token_id TEXT,
     >   ADD COLUMN IF NOT EXISTS nft_contract_address TEXT;
     > ```

  4. **Deploy the NFT contract** (only once or when you change networks):
     ```bash
     cd server
     npm install --legacy-peer-deps   # if dependency warnings appear
     npx hardhat run deploy.js --network localhost   # or your chosen network
     # copy the deployed address and set NFT_CONTRACT_ADDRESS in .env
     ```

  5. **Start the application**
     ```bash
     # from project root
     npm run dev
     ```

  The command above starts both:
  - API server on `API_PORT` (default `4000`)
  - Vite client on `VITE_PORT` (default `3000`)

  Notes:
  - If `VITE_PORT` equals `API_PORT`, Vite automatically moves to the next port to avoid proxy loop errors.
  - API proxy uses `127.0.0.1` to avoid `localhost` dual-stack connection issues.

  ## NFT Coupons (Polygon/Ethereum)

  This project includes a small ERC‑721 contract (`server/contracts/CouponNFT.sol`) that is used to mint **coupon NFTs** for customers. The admin UI allows you to create an on‑chain coupon which also saves a normal row in the `coupons` table with `nft_token_id`/`nft_contract_address` fields.

  ### Deploying the contract

  Make sure your `.env` has a valid `PRIVATE_KEY` and `RPC_URL` pointing to a network (Ganache, localhost, testnet, etc.).

  ```bash
  cd server
  npm install      # or yarn
  # if you hit peer‑dependency errors use:
  #   npm install --legacy-peer-deps
  # the hardhat toolbox already bundles ethers, so we removed the
  # standalone @nomicfoundation/hardhat-ethers dependency to avoid
  # conflicts.
  npx hardhat run deploy.js --network localhost   # change network name as needed
  ```

  Copy the address printed by the script and set `NFT_CONTRACT_ADDRESS` in your `.env` (and `.env.example` as a reference).

  ### Minting coupons

  * Use the admin panel under **Coupons** -> **Create Coupon** and enter a wallet address.
  * The backend will call the smart contract and then persist the coupon with `nftTokenId`.
  * The API `/api/coupons` now returns `nftTokenId` and `nftContractAddress` which are displayed in the UI.

  When you rebuild or deploy elsewhere, remember to update the environment variable accordingly.

{
  "email": "hager@gmail.com",
  "password": "Customer!3",
  "role": "customer"
}
