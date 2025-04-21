import os
import json
from solcx import compile_source, install_solc
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

def deploy_contract():
    try:
        # Install solc
        print("Installing Solidity compiler...")
        install_solc('0.8.0')
        
        # Read contract source
        print("Reading contract source...")
        with open('contracts/AppointmentContract.sol', 'r') as file:
            contract_source = file.read()
        
        # Compile contract
        print("Compiling contract...")
        compiled_sol = compile_source(
            contract_source,
            output_values=['abi', 'bin'],
            solc_version='0.8.0'
        )
        
        # Get contract interface
        contract_id, contract_interface = compiled_sol.popitem()
        bytecode = contract_interface['bin']
        abi = contract_interface['abi']
        
        # Save ABI to file
        print("Saving contract ABI...")
        os.makedirs('contracts', exist_ok=True)
        with open('contracts/AppointmentContract.json', 'w') as f:
            json.dump({'abi': abi, 'bytecode': bytecode}, f)
        
        # Connect to Ganache
        print("Connecting to Ganache...")
        w3 = Web3(Web3.HTTPProvider(os.getenv('ETHEREUM_RPC_URL')))
        
        # Verify connection
        if not w3.is_connected():
            raise ConnectionError("Failed to connect to Ganache. Please make sure it's running.")
        
        # Get deployer account
        private_key = os.getenv('PRIVATE_KEY')
        if not private_key:
            raise ValueError("PRIVATE_KEY not found in .env file")
        
        # Remove '0x' prefix if present
        if private_key.startswith('0x'):
            private_key = private_key[2:]
            
        account = w3.eth.account.from_key(private_key)
        print(f"Deploying from account: {account.address}")
        
        # Check account balance
        balance = w3.eth.get_balance(account.address)
        print(f"Account balance: {w3.from_wei(balance, 'ether')} ETH")
        
        # Estimate gas
        AppointmentContract = w3.eth.contract(abi=abi, bytecode=bytecode)
        gas_price = w3.eth.gas_price
        estimated_gas = 3000000  # Reasonable estimate for this contract
        total_cost_wei = estimated_gas * gas_price
        total_cost_eth = w3.from_wei(total_cost_wei, 'ether')
        
        print(f"Estimated gas: {estimated_gas} units")
        print(f"Gas price: {w3.from_wei(gas_price, 'gwei')} gwei")
        print(f"Total estimated cost: {total_cost_eth} ETH")
        
        # Check if account has enough funds
        if balance < total_cost_wei:
            print(f"\nError: Insufficient funds. Account has {w3.from_wei(balance, 'ether')} ETH but needs {total_cost_eth} ETH.")
            print("\nPlease add funds to this account in Ganache:")
            print(f"  1. Open Ganache UI")
            print(f"  2. Find the account: {account.address}")
            print(f"  3. Add at least {total_cost_eth} ETH to this account")
            print(f"  4. Run this script again")
            return
        
        # Build transaction
        construct_txn = AppointmentContract.constructor().build_transaction({
            'from': account.address,
            'nonce': w3.eth.get_transaction_count(account.address),
            'gas': estimated_gas,
            'gasPrice': gas_price
        })
        
        # Sign transaction
        print("Signing transaction...")
        signed = w3.eth.account.sign_transaction(construct_txn, private_key)
        
        # Send transaction
        print("Sending transaction...")
        tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
        
        # Wait for receipt
        print("Waiting for transaction receipt...")
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        print(f"\nContract deployed successfully!")
        print(f"Contract address: {tx_receipt.contractAddress}")
        print("\nPlease update your .env file with this address")
        print("Update the APPOINTMENT_CONTRACT_ADDRESS line with the new address")
        
    except Exception as e:
        print(f"\nError during deployment: {str(e)}")
        raise

if __name__ == "__main__":
    deploy_contract() 