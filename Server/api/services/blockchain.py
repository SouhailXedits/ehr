import os
import json
from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv
import logging

logger = logging.getLogger('api')

load_dotenv()

class BlockchainService:
    def __init__(self):
        try:
            logger.info("=== Initializing BlockchainService ===")
            
            # Initialize Web3
            rpc_url = os.getenv('ETHEREUM_RPC_URL', 'http://localhost:8545')
            logger.info(f"Connecting to Ethereum node at: {rpc_url}")
            self.w3 = Web3(Web3.HTTPProvider(rpc_url))
            
            if not self.w3.is_connected():
                raise Exception("Failed to connect to Ethereum node")
            logger.info("Successfully connected to Ethereum node")
            
            # Load contract address
            self.contract_address = os.getenv('APPOINTMENT_CONTRACT_ADDRESS')
            if not self.contract_address:
                raise Exception("APPOINTMENT_CONTRACT_ADDRESS not set in environment")
            logger.info(f"Using contract address: {self.contract_address}")
            
            # Load private key
            self.private_key = os.getenv('PRIVATE_KEY')
            if not self.private_key:
                raise Exception("PRIVATE_KEY not set in environment")
            logger.info("Private key loaded")
            
            # Load contract ABI
            try:
                project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                contract_path = os.path.join(project_root, 'contracts', 'AppointmentContract.json')
                logger.info(f"Loading contract from: {contract_path}")
                
                with open(contract_path, 'r') as f:
                    contract_json = json.load(f)
                    self.contract_abi = contract_json['abi']
                logger.info("Contract ABI loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load contract ABI: {str(e)}")
                raise
            
            # Initialize contract
            self.contract = self.w3.eth.contract(
                address=self.contract_address,
                abi=self.contract_abi
            )
            logger.info("Contract initialized successfully")
            logger.info("=== BlockchainService Initialization Complete ===")
            
        except Exception as e:
            logger.error(f"Error Initializing BlockchainService: {str(e)}")
            raise

    def create_appointment(self, patient_address, doctor_address, timestamp):
        try:
            logger.info("=== Starting Blockchain Transaction ===")
            logger.info(f"Patient Address: {patient_address}")
            logger.info(f"Doctor Address: {doctor_address}")
            logger.info(f"Timestamp: {timestamp}")
            
            # Convert addresses to checksum format
            patient_address = Web3.to_checksum_address(patient_address)
            doctor_address = Web3.to_checksum_address(doctor_address)
            logger.info(f"Checksum Addresses - Patient: {patient_address}, Doctor: {doctor_address}")
            
            # Get deposit amount from contract
            deposit_amount = self.contract.functions.DEPOSIT_AMOUNT().call()
            logger.info(f"Deposit Amount: {deposit_amount}")
            
            # Get patient's balance
            patient_balance = self.w3.eth.get_balance(patient_address)
            logger.info(f"Patient Balance: {patient_balance}")
            
            # Get patient's private key from environment
            patient_private_key = os.getenv('PATIENT_PRIVATE_KEY')
            if not patient_private_key:
                raise Exception("PATIENT_PRIVATE_KEY not set in environment")
            
            # Get the current appointment count before the transaction
            try:
                # Since appointmentCount is incremented when a new appointment is created,
                # the current count + 1 will be the new appointment ID
                current_count = self.contract.functions.appointmentCount().call()
                logger.info(f"Current appointment count: {current_count}")
                # The new appointment ID will be current_count + 1
                expected_id = current_count + 1
                logger.info(f"Expected new appointment ID: {expected_id}")
            except Exception as e:
                logger.error(f"Failed to get current appointment count: {str(e)}")
                expected_id = None
            
            # Build transaction
            nonce = self.w3.eth.get_transaction_count(patient_address)
            
            # Build contract transaction call
            tx = self.contract.functions.createAppointment(
                doctor_address,
                timestamp
            ).build_transaction({
                'from': patient_address,
                'value': deposit_amount,
                'gas': 200000,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': nonce,
            })
            
            # Sign the transaction
            signed_tx = Account.sign_transaction(tx, patient_private_key)
            
            # Send the transaction
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            logger.info(f"Transaction Hash: {tx_hash.hex()}")
            
            # Wait for receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            logger.info(f"Transaction Receipt: {receipt}")
            
            # Get appointment ID from event logs
            appointment_id = None
            try:
                # Try to get from event logs
                for log in receipt.logs:
                    if log.address.lower() == self.contract_address.lower():
                        logger.info(f"Found log for our contract: {log}")
                        try:
                            # Process log manually 
                            event_signature_hash = self.w3.keccak(text="AppointmentCreated(uint256,address,address,uint256)").hex()
                            logger.info(f"Event signature hash: {event_signature_hash}")
                            
                            if log.topics and len(log.topics) > 0:
                                for i, topic in enumerate(log.topics):
                                    logger.info(f"Topic {i}: {topic.hex()}")
                                
                            if log.data:
                                logger.info(f"Log data: {log.data.hex()}")
                                # Decode the log data
                                decoded_data = self.w3.codec.decode_abi(
                                    ['uint256', 'address', 'address', 'uint256'], 
                                    bytes.fromhex(log.data.hex()[2:])  # Remove '0x' prefix
                                )
                                logger.info(f"Decoded data: {decoded_data}")
                                if decoded_data and len(decoded_data) > 0:
                                    appointment_id = decoded_data[0]
                                    logger.info(f"Extracted appointment ID from decoded data: {appointment_id}")
                                    break
                        except Exception as e:
                            logger.warning(f"Error processing log manually: {str(e)}")
                            continue
                
                # If we still don't have an ID, use the expected ID
                if appointment_id is None and expected_id is not None:
                    appointment_id = expected_id
                    logger.info(f"Using expected appointment ID: {appointment_id}")
                    
                # If we still don't have an ID, get the current count after transaction 
                if appointment_id is None:
                    # Get the current appointment count after the transaction
                    current_count = self.contract.functions.appointmentCount().call()
                    appointment_id = current_count
                    logger.info(f"Using current appointment count as ID: {appointment_id}")
            except Exception as e:
                logger.error(f"Error extracting appointment ID: {str(e)}")
                
            logger.info("=== Transaction Completed Successfully ===")
            return {
                'success': True,
                'appointment_id': appointment_id,
                'transaction_hash': tx_hash.hex()
            }
            
        except Exception as e:
            logger.error(f"Blockchain Transaction Failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

    def confirm_appointment(self, doctor_address, appointment_id):
        try:
            doctor_address = Web3.to_checksum_address(doctor_address)
            
            # Build transaction
            nonce = self.w3.eth.get_transaction_count(doctor_address)
            
            tx = self.contract.functions.confirmAppointment(
                appointment_id
            ).build_transaction({
                'from': doctor_address,
                'gas': 200000,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': nonce
            })
            
            # Sign the transaction
            signed_tx = Account.sign_transaction(tx, self.private_key)
            
            # Send the transaction
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            
            # Wait for receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {
                'success': True,
                'transaction_hash': tx_hash.hex()
            }
            
        except Exception as e:
            logger.error(f"Failed to confirm appointment: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

    def complete_appointment(self, doctor_address, appointment_id):
        try:
            doctor_address = Web3.to_checksum_address(doctor_address)
            
            # Build transaction
            nonce = self.w3.eth.get_transaction_count(doctor_address)
            
            tx = self.contract.functions.completeAppointment(
                appointment_id
            ).build_transaction({
                'from': doctor_address,
                'gas': 200000,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': nonce
            })
            
            # Sign the transaction
            signed_tx = Account.sign_transaction(tx, self.private_key)
            
            # Send the transaction
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            
            # Wait for receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {
                'success': True,
                'transaction_hash': tx_hash.hex()
            }
            
        except Exception as e:
            logger.error(f"Failed to complete appointment: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

    def cancel_appointment(self, user_address, appointment_id):
        try:
            user_address = Web3.to_checksum_address(user_address)
            
            # Build transaction
            nonce = self.w3.eth.get_transaction_count(user_address)
            
            tx = self.contract.functions.cancelAppointment(
                appointment_id
            ).build_transaction({
                'from': user_address,
                'gas': 200000,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': nonce
            })
            
            # Sign the transaction
            signed_tx = Account.sign_transaction(tx, self.private_key)
            
            # Send the transaction
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            
            # Wait for receipt
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {
                'success': True,
                'transaction_hash': tx_hash.hex()
            }
            
        except Exception as e:
            logger.error(f"Failed to cancel appointment: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }

    def get_appointment(self, appointment_id):
        try:
            appointment = self.contract.functions.getAppointment(appointment_id).call()
            
            return {
                'success': True,
                'appointment': {
                    'id': appointment[0],
                    'patient': appointment[1],
                    'doctor': appointment[2],
                    'timestamp': appointment[3],
                    'status': appointment[4],
                    'deposit': appointment[5]
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to get appointment: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            } 