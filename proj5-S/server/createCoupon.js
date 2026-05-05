require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { promisify } = require('util');

const { ethers } = require('ethers');
const { pool } = require('./db');

const nftArtifact = require("./abi/CouponNFT.json");
const abi = require('./NFT_ABI.json');

const router = express.Router();

// ✅ provider (ethers v5)
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

// ✅ wallet
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// ✅ contract
const nftContract = new ethers.Contract(
  process.env.NFT_CONTRACT_ADDRESS,
  nftArtifact.abi,
  wallet
);

console.log('NFT Service initialized:', {
  wallet: wallet.address,
  contract: process.env.NFT_CONTRACT_ADDRESS,
});


// =========================
// GET coupons
// =========================
async function getUserCouponsHandler(req, res) {
  const { walletAddress } = req.query;

  if (!walletAddress) {
    return res.status(400).json({ error: 'walletAddress is required' });
  }

  try {
    const query = `
      SELECT *
      FROM coupons
      WHERE nft_contract_address = $1 AND status = 'active'
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [process.env.NFT_CONTRACT_ADDRESS]);

    const ownerLower = walletAddress.toLowerCase();

    const allItems = [];

    for (const row of result.rows) {
      const item = { ...row, onChainOwner: null, ownerMatch: null };

      if (row.nft_token_id && row.nft_token_id !== 'unknown') {
        try {
          const owner = await nftContract.ownerOf(row.nft_token_id);
          item.onChainOwner = owner;
          item.ownerMatch = owner.toLowerCase() === ownerLower;
        } catch {
          item.onChainOwner = 'error';
        }
      }

      allItems.push(item);
    }

    const filtered = allItems.filter(
      (c) => c.ownerMatch === true || !c.nft_token_id
    );

    res.json({ coupons: filtered });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
}

router.get('/coupons', getUserCouponsHandler);


// =========================
// CREATE coupon
// =========================
router.post('/create-coupon', async (req, res) => {
  const { code, discountType, discountValue, walletAddress } = req.body;

  try {
    const tx = await nftContract.mintCoupon(
      walletAddress,
      code,
      Number(discountValue)
    );

    const receipt = await tx.wait();

    res.json({
      success: true,
      tx: tx.hash,
      block: receipt.blockNumber
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// =========================
// EXPORT (ONLY ONCE)
// =========================
module.exports = router;
module.exports.getUserCouponsHandler = getUserCouponsHandler;