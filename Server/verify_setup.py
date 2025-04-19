#!/usr/bin/env python
"""
EHR System Setup Verification Script
This script checks if your environment is properly configured for the EHR system.
"""

import os
import sys
import json
from pathlib import Path
import django
import importlib.util
from dotenv import load_dotenv

# Set up colored output
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
RESET = '\033[0m'
BOLD = '\033[1m'

def success(message):
    print(f"{GREEN}✓ {message}{RESET}")

def warning(message):
    print(f"{YELLOW}⚠ {message}{RESET}")

def error(message):
    print(f"{RED}✗ {message}{RESET}")

def header(message):
    print(f"\n{BOLD}{message}{RESET}")

def check_python_version():
    header("Checking Python Version")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        success(f"Python {version.major}.{version.minor}.{version.micro} detected (3.8+ required)")
        return True
    else:
        error(f"Python {version.major}.{version.minor}.{version.micro} detected (3.8+ required)")
        return False

def check_dependencies():
    header("Checking Required Python Packages")
    required_packages = [
        ('django', 'Django', '4.0'),
        ('web3', 'Web3.py', '6.0'),
        ('solcx', 'py-solc-x', '1.0'),
        ('dotenv', 'python-dotenv', '0.19.0'),
        ('rest_framework', 'Django REST Framework', '3.13')
    ]
    
    all_installed = True
    for package, name, min_version in required_packages:
        try:
            module = importlib.import_module(package)
            if hasattr(module, '__version__'):
                version = module.__version__
                success(f"{name} {version} is installed")
            else:
                success(f"{name} is installed (version unknown)")
        except ImportError:
            error(f"{name} is not installed")
            all_installed = False
    
    return all_installed

def check_environment_vars():
    header("Checking Environment Variables")
    load_dotenv()
    
    required_vars = [
        'ETHEREUM_RPC_URL',
        'APPOINTMENT_CONTRACT_ADDRESS',
        'PRIVATE_KEY',
        'PATIENT_PRIVATE_KEY'
    ]
    
    all_vars_set = True
    for var in required_vars:
        value = os.getenv(var)
        if value:
            if var.endswith('_KEY') and value.startswith('0x'):
                warning(f"{var} is set, but starts with '0x' prefix (should be removed)")
            else:
                success(f"{var} is set")
        else:
            error(f"{var} is not set")
            all_vars_set = False
    
    return all_vars_set

def check_ganache():
    header("Checking Ganache Connection")
    try:
        from web3 import Web3
        ethereum_rpc_url = os.getenv('ETHEREUM_RPC_URL', 'http://127.0.0.1:7545')
        w3 = Web3(Web3.HTTPProvider(ethereum_rpc_url))
        
        if w3.is_connected():
            network_id = w3.eth.chain_id
            success(f"Connected to Ethereum node at {ethereum_rpc_url}")
            success(f"Network ID: {network_id}")
            success(f"Current block number: {w3.eth.block_number}")
            
            # Check accounts
            accounts = w3.eth.accounts
            if accounts:
                success(f"Found {len(accounts)} accounts")
                for i, account in enumerate(accounts[:3]):  # Show first 3 accounts
                    balance = w3.eth.get_balance(account)
                    balance_eth = w3.from_wei(balance, 'ether')
                    success(f"Account {i+1}: {account} (Balance: {balance_eth} ETH)")
            else:
                warning("No accounts found in Ganache")
            
            return True
        else:
            error(f"Failed to connect to Ethereum node at {ethereum_rpc_url}")
            return False
    except Exception as e:
        error(f"Error connecting to Ganache: {str(e)}")
        return False

def check_contract():
    header("Checking Smart Contract")
    
    # Check if contract address is set
    contract_address = os.getenv('APPOINTMENT_CONTRACT_ADDRESS')
    if not contract_address:
        error("APPOINTMENT_CONTRACT_ADDRESS not set in .env file")
        return False
    
    # Check if contract JSON exists
    contract_path = Path("contracts/AppointmentContract.json")
    if not contract_path.exists():
        error(f"Contract JSON file not found at {contract_path}")
        return False
    
    # Check contract JSON content
    try:
        with open(contract_path, 'r') as f:
            contract_json = json.load(f)
        
        if 'abi' not in contract_json:
            error("Contract JSON is missing 'abi' field")
            return False
        
        success(f"Contract ABI loaded successfully")
        success(f"Contract address: {contract_address}")
        
        # Try to interact with contract
        try:
            from web3 import Web3
            ethereum_rpc_url = os.getenv('ETHEREUM_RPC_URL', 'http://127.0.0.1:7545')
            w3 = Web3(Web3.HTTPProvider(ethereum_rpc_url))
            
            if w3.is_connected():
                # Convert to checksum address
                checksum_address = Web3.to_checksum_address(contract_address)
                contract = w3.eth.contract(address=checksum_address, abi=contract_json['abi'])
                
                # Try to call a read function
                try:
                    deposit_amount = contract.functions.DEPOSIT_AMOUNT().call()
                    success(f"Successfully called contract function (Deposit amount: {w3.from_wei(deposit_amount, 'ether')} ETH)")
                    return True
                except Exception as e:
                    error(f"Error calling contract function: {str(e)}")
                    return False
            else:
                warning("Skipping contract interaction test (Ganache not connected)")
                return True
        except Exception as e:
            error(f"Error setting up contract: {str(e)}")
            return False
    except Exception as e:
        error(f"Error reading contract JSON: {str(e)}")
        return False

def run_all_checks():
    print(f"{BOLD}EHR System Setup Verification{RESET}")
    print("This script checks if your environment is correctly set up for the EHR system.")
    print("===========================================================")
    
    python_ok = check_python_version()
    deps_ok = check_dependencies()
    env_ok = check_environment_vars()
    ganache_ok = check_ganache()
    contract_ok = check_contract()
    
    print("\n===========================================================")
    header("Setup Verification Results")
    
    if all([python_ok, deps_ok, env_ok, ganache_ok, contract_ok]):
        success("All checks passed! Your environment is correctly set up.")
        print("\nYou can now start the application:")
        print("  1. Start the backend server: python manage.py runserver")
        print("  2. Start the frontend: cd ../React-Healthcare-Frontend && npm run dev")
    else:
        error("Some checks failed. Please fix the issues highlighted above.")
        
        if not python_ok:
            print("\nTo fix Python version:")
            print("  - Install Python 3.8 or higher from https://www.python.org/downloads/")
        
        if not deps_ok:
            print("\nTo fix missing dependencies:")
            print("  - Run: pip install -r requirements.txt")
        
        if not env_ok:
            print("\nTo fix environment variables:")
            print("  - Create/update the .env file in the Server directory")
            print("  - Add the missing environment variables")
        
        if not ganache_ok:
            print("\nTo fix Ganache connection:")
            print("  - Make sure Ganache is running")
            print("  - Verify the ETHEREUM_RPC_URL in your .env file")
        
        if not contract_ok:
            print("\nTo fix contract issues:")
            print("  - Run the contract deployment script: python deploy_contract.py")
            print("  - Update the APPOINTMENT_CONTRACT_ADDRESS in your .env file")

if __name__ == "__main__":
    # Change directory to the script's directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    run_all_checks() 