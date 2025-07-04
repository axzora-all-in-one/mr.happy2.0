from fastapi import APIRouter, HTTPException, Query
from typing import List
from datetime import datetime
from ..models.wallet import WalletBalance, WalletTransaction, HappyPaisaTransaction, TransactionCreate
from ..services.wallet_service import WalletService
from ..services.blockchain_wallet_service import BlockchainWalletService

router = APIRouter(prefix="/api/wallet", tags=["wallet"])

@router.get("/health")
async def wallet_health():
    """Wallet service health check with blockchain status"""
    try:
        from ..services.blockchain_gateway_service import blockchain_gateway
        
        # Check blockchain connectivity
        chain_status = await blockchain_gateway.get_chain_status()
        
        return {
            "status": "healthy",
            "service": "blockchain_wallet",
            "database": "connected",
            "blockchain": {
                "status": chain_status["status"],
                "network": chain_status["network"],
                "latest_block": chain_status["chain_info"]["currentBlock"]
            },
            "features": {
                "blockchain_integration": "operational",
                "p2p_transfers": "operational",
                "mint_burn": "operational",
                "balance_sync": "operational"
            }
        }
    except Exception as e:
        return {
            "status": "degraded",
            "service": "blockchain_wallet",
            "error": str(e)
        }

# New blockchain-specific endpoints
@router.post("/p2p-transfer")
async def peer_to_peer_transfer(
    from_user_id: str = Query(...),
    to_user_id: str = Query(...),
    amount_hp: float = Query(..., gt=0),
    description: str = Query(default="P2P Transfer")
):
    """Transfer Happy Paisa between users via blockchain"""
    try:
        tx_hash = await BlockchainWalletService.transfer_to_user(
            from_user_id, to_user_id, amount_hp, description
        )
        
        return {
            "success": True,
            "message": f"Transferred {amount_hp} HP from {from_user_id} to {to_user_id}",
            "blockchain_hash": tx_hash,
            "amount_hp": amount_hp,
            "from_user": from_user_id,
            "to_user": to_user_id,
            "network": "happy-paisa-mainnet"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"P2P transfer failed: {str(e)}")

@router.get("/{user_id}/blockchain-address")
async def get_user_blockchain_address(user_id: str):
    """Get user's blockchain address"""
    try:
        from ..services.blockchain_gateway_service import blockchain_gateway
        
        address = await blockchain_gateway.get_or_create_user_address(user_id)
        return {
            "user_id": user_id,
            "address": address.address,
            "public_key": address.public_key,
            "network": address.network,
            "address_format": "Substrate/Polkadot format"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get blockchain address: {str(e)}")

@router.get("/{user_id}/blockchain-transactions")
async def get_blockchain_transactions(
    user_id: str,
    limit: int = Query(default=50, le=100)
):
    """Get user's complete blockchain transaction history"""
    try:
        transactions = await BlockchainWalletService.get_blockchain_transactions(user_id, limit)
        
        return {
            "user_id": user_id,
            "transactions": transactions,
            "count": len(transactions),
            "network": "happy-paisa-mainnet",
            "note": "These are on-chain transactions with full immutability"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get blockchain transactions: {str(e)}")

@router.post("/{user_id}/sync-blockchain")
async def sync_user_blockchain_state(user_id: str):
    """Sync user's local wallet state with blockchain"""
    try:
        sync_result = await BlockchainWalletService.sync_blockchain_state(user_id)
        
        return {
            "success": True,
            "message": "Blockchain state synchronized",
            "sync_result": sync_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Blockchain sync failed: {str(e)}")

@router.get("/{user_id}/analytics")
async def get_wallet_analytics(
    user_id: str,
    days: int = Query(default=30, le=365)
):
    """Get comprehensive wallet analytics with blockchain insights"""
    try:
        analytics = await BlockchainWalletService.get_wallet_analytics(user_id, days)
        
        return {
            "user_id": user_id,
            "period_days": days,
            "analytics": analytics,
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get wallet analytics: {str(e)}")

@router.post("/transactions")
async def add_transaction(transaction_data: dict):
    """Add a wallet transaction via blockchain"""
    try:
        from ..models.wallet import WalletTransaction
        
        # Create transaction object
        transaction = WalletTransaction(
            user_id=transaction_data.get("user_id"),
            type=transaction_data.get("type"),
            amount_hp=transaction_data.get("amount_hp"),
            description=transaction_data.get("description"),
            category=transaction_data.get("category", "Other"),
            reference_id=transaction_data.get("reference_id")
        )
        
        # Process via blockchain wallet service
        transaction_id = await BlockchainWalletService.add_transaction(transaction)
        
        return {
            "success": True,
            "transaction_id": transaction_id,
            "message": "Transaction processed via blockchain",
            "amount_hp": transaction.amount_hp,
            "type": transaction.type,
            "blockchain_hash": getattr(transaction, 'blockchain_hash', None)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add transaction: {str(e)}")

@router.get("/{user_id}/balance", response_model=WalletBalance)
async def get_wallet_balance(user_id: str):
    """Get user's Happy Paisa balance from blockchain"""
    try:
        # Use blockchain wallet service for balance
        balance = await BlockchainWalletService.get_balance(user_id)
        return {
            "user_id": user_id,
            "balance_hp": balance.balance_hp,
            "balance_inr_equiv": balance.balance_inr_equiv,
            "blockchain_address": balance.blockchain_address,
            "network": balance.network,
            "last_updated": balance.last_updated.isoformat(),
            "spending_breakdown": balance.spending_breakdown,
            "recent_transactions": balance.recent_transactions[:5]  # Latest 5 for quick view
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get balance: {str(e)}")

@router.post("/{user_id}/transactions", response_model=HappyPaisaTransaction)
async def add_transaction(user_id: str, transaction: TransactionCreate):
    """Add a new transaction to the wallet"""
    try:
        wallet_transaction = WalletTransaction(
            user_id=user_id,
            type=transaction.type,
            amount_hp=transaction.amount_hp,
            description=transaction.description,
            category=transaction.category,
            reference_id=transaction.reference_id
        )
        
        new_transaction = await WalletService.add_transaction(wallet_transaction)
        return new_transaction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add transaction: {str(e)}")

@router.get("/{user_id}/transactions", response_model=List[HappyPaisaTransaction])
async def get_transactions(user_id: str, limit: int = 50, offset: int = 0):
    """Get user's transaction history"""
    try:
        transactions = await WalletService.get_transactions(user_id, limit, offset)
        return transactions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get transactions: {str(e)}")

@router.post("/{user_id}/credit", response_model=HappyPaisaTransaction)
async def credit_wallet(user_id: str, amount_hp: float, description: str = "Wallet top-up"):
    """Credit Happy Paisa to user's wallet"""
    try:
        transaction = WalletTransaction(
            user_id=user_id,
            type="credit",
            amount_hp=amount_hp,
            description=description,
            category="Top-up"
        )
        
        new_transaction = await WalletService.add_transaction(transaction)
        return new_transaction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to credit wallet: {str(e)}")

@router.post("/{user_id}/debit", response_model=HappyPaisaTransaction)
async def debit_wallet(user_id: str, amount_hp: float, description: str, category: str = "Payment"):
    """Debit Happy Paisa from user's wallet"""
    try:
        # Check balance first
        balance = await WalletService.get_balance(user_id)
        if balance.balance_hp < amount_hp:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        
        transaction = WalletTransaction(
            user_id=user_id,
            type="debit",
            amount_hp=amount_hp,
            description=description,
            category=category
        )
        
        new_transaction = await WalletService.add_transaction(transaction)
        return new_transaction
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to debit wallet: {str(e)}")

@router.post("/transfer")
async def transfer_hp(from_user_id: str, to_user_id: str, amount_hp: float, description: str = "Transfer"):
    """Transfer Happy Paisa between users"""
    try:
        success = await WalletService.transfer_hp(from_user_id, to_user_id, amount_hp, description)
        if not success:
            raise HTTPException(status_code=400, detail="Transfer failed - insufficient balance")
        
        return {"message": "Transfer successful", "amount_hp": amount_hp}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transfer failed: {str(e)}")

@router.post("/{user_id}/convert/inr-to-hp")
async def convert_inr_to_hp(user_id: str, amount_inr: float):
    """Convert INR to Happy Paisa (1000 INR = 1 HP)"""
    try:
        amount_hp = amount_inr / 1000
        
        transaction = WalletTransaction(
            user_id=user_id,
            type="credit",
            amount_hp=amount_hp,
            description=f"INR to HP conversion: ₹{amount_inr}",
            category="Conversion"
        )
        
        new_transaction = await WalletService.add_transaction(transaction)
        return {
            "converted_amount_hp": amount_hp,
            "converted_from_inr": amount_inr,
            "transaction": new_transaction
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")

@router.post("/{user_id}/convert/hp-to-inr")
async def convert_hp_to_inr(user_id: str, amount_hp: float):
    """Convert Happy Paisa to INR (1 HP = 1000 INR)"""
    try:
        # Check balance
        balance = await WalletService.get_balance(user_id)
        if balance.balance_hp < amount_hp:
            raise HTTPException(status_code=400, detail="Insufficient Happy Paisa balance")
        
        amount_inr = amount_hp * 1000
        
        transaction = WalletTransaction(
            user_id=user_id,
            type="debit",
            amount_hp=amount_hp,
            description=f"HP to INR conversion: {amount_hp} HP",
            category="Conversion"
        )
        
        new_transaction = await WalletService.add_transaction(transaction)
        return {
            "converted_amount_inr": amount_inr,
            "converted_from_hp": amount_hp,
            "transaction": new_transaction
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")