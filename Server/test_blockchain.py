import os
from web3 import Web3
from api.services.blockchain import BlockchainService
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

def test_blockchain_integration():
    # Initialize blockchain service
    blockchain = BlockchainService()
    
    # Get the private key from env
    private_key = os.getenv('PRIVATE_KEY')
    
    # Create Web3 instance
    w3 = Web3(Web3.HTTPProvider(os.getenv('ETHEREUM_RPC_URL')))
    
    # Get account from private key
    account = w3.eth.account.from_key(private_key)
    patient_address = account.address  # Use the account from our private key
    
    # Test addresses from Ganache
    patient_address = "0x57Ec85A4B0956A91C804be53575f839452EB5D12"  # Account from our private key
    doctor_address = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"   # Any other address
    
    # Test appointment timestamp (1 hour from now)
    timestamp = int((datetime.now() + timedelta(hours=1)).timestamp())
    
    print("Testing appointment creation...")
    result = blockchain.create_appointment(patient_address, doctor_address, timestamp)
    print(f"Create appointment result: {result}")
    
    if result['success']:
        appointment_id = result['appointment_id']
        print(f"\nTesting appointment confirmation...")
        confirm_result = blockchain.confirm_appointment(doctor_address, appointment_id)
        print(f"Confirm appointment result: {confirm_result}")
        
        print(f"\nTesting appointment completion...")
        complete_result = blockchain.complete_appointment(doctor_address, appointment_id)
        print(f"Complete appointment result: {complete_result}")
        
        print(f"\nTesting appointment retrieval...")
        get_result = blockchain.get_appointment(appointment_id)
        print(f"Get appointment result: {get_result}")

if __name__ == "__main__":
    test_blockchain_integration() 