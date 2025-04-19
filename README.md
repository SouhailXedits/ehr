# EHR Blockchain System

A secure Electronic Health Record system using blockchain technology to manage patient records, appointments, and medical data. This system integrates Django backend with a modern React frontend and leverages Ethereum smart contracts for secure data management.

## Project Structure

- `Server/`: Django backend with blockchain integration
- `React-Healthcare-Frontend/`: Modern React frontend (Latest version)
- `contracts/`: Solidity smart contracts

## Quick Start Guide

1. **Clone the repository**:
   ```bash
   git clone <repository-url> ehr
   cd ehr
   ```

2. **Set up backend**:
   ```bash
   cd Server
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Deploy smart contract**:
   - Start Ganache
   - Run: `python3 deploy_contract.py`
   - Set up `.env` file with contract address and keys

4. **Verify setup**:
   ```bash
   python3 verify_setup.py
   ```
   This script will check if your environment is correctly configured and provide guidance to fix any issues.

5. **Start servers**:
   ```bash
   # Backend (from Server directory)
   python3 manage.py runserver
   
   # Frontend (from React-Healthcare-Frontend directory)
   cd ../React-Healthcare-Frontend
   npm install
   npm run dev
   ```

For detailed instructions, see the complete guide below.

## Complete Setup Guide for React Frontend (Latest Version)

### Prerequisites
- Python 3.8+ 
- Node.js 16+
- Git
- MetaMask browser extension
- Ganache (local Ethereum blockchain)
- py-solc-x (for compiling Solidity contracts)

### Initial Setup

1. Clone the repository:
   ```bash
   git clone <repository-url> ehr
   cd ehr
   ```

### Backend Setup

2. Create and activate Python virtual environment:
   ```bash
   cd Server
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   pip install py-solc-x  # Ensure solc compiler is installed
   ```

4. Install Solidity compiler explicitly (if not included in requirements):
   ```bash
   # In Python interpreter or script
   from solcx import install_solc
   install_solc(version='0.8.0')  # Version must match contract pragma
   ```

### Smart Contract Setup

5. Install and set up Ganache:
   - Download and install Ganache from https://trufflesuite.com/ganache/
   - Launch Ganache and create a new workspace
   - Configure workspace settings:
     - Server: `HTTP://127.0.0.1:7545` (default)
     - Network ID: `5777` (default)
     - Automine: Enabled (recommended for development)

6. Deploy the smart contract using the provided script:
   ```bash
   cd ../Server
   python3 deploy_contract.py
   ```
   
   This script will:
   - Install the Solidity compiler
   - Compile the contract
   - Save the ABI to a JSON file
   - Deploy the contract to your local Ganache blockchain
   - Output the contract address to use in your `.env` file
   
   If you encounter any errors:
   - Ensure Ganache is running
   - Check that `py-solc-x` is installed correctly
   - Verify the contract compiles with Solidity 0.8.0

7. Get keys from Ganache:
   - Contract address: From step 6 (copied from terminal output) or from Ganache UI under "Contracts"
   - Private keys: From Ganache UI, click on the key icon next to any account to view its private key
   - You'll need two different accounts: one for doctor and one for patient

### Environment Configuration

8. Create `.env` file in the Server directory (if not already created):
   ```bash
   cd ../Server
   touch .env  # On Windows: type nul > .env
   ```

9. Add the following to `.env` (use a text editor):
   ```
   ETHEREUM_RPC_URL=http://127.0.0.1:7545
   APPOINTMENT_CONTRACT_ADDRESS=<contract_address_from_deployment>
   PRIVATE_KEY=<doctor_private_key_from_ganache>
   PATIENT_PRIVATE_KEY=<patient_private_key_from_ganache>
   ```

   Important:
   - Do NOT include the `0x` prefix in private keys (remove it if copied from Ganache)
   - Use `127.0.0.1` instead of `localhost` to avoid potential DNS issues
   - Ensure there are no spaces around the equal signs

### Setup Verification

10. Run the verification script to ensure everything is configured correctly:
    ```bash
    python3 verify_setup.py
    ```
    
    This script will:
    - Check your Python version and dependencies
    - Verify environment variables are properly set
    - Test the connection to Ganache
    - Validate the smart contract deployment
    - Provide guidance to fix any detected issues
    
    If the script reports any problems, follow the provided instructions to resolve them before proceeding.

### Testing Blockchain Integration

11. Run the blockchain integration test:
    ```bash
    python3 test_blockchain.py
    ```
    
    This script will:
    - Create a test appointment
    - Confirm the appointment
    - Complete the appointment
    - Retrieve the appointment details
    
    If all tests pass, your blockchain integration is working correctly.
    
    Troubleshooting:
    - If tests fail, check your `.env` file configuration
    - Verify Ganache is running and accounts have sufficient ETH
    - Check the contract deployment was successful

### Database Setup

12. Initialize the Django database:
    ```bash
    python3 manage.py makemigrations
    python3 manage.py migrate
    ```

13. (Optional) Create a superuser for admin access:
    ```bash
    python3 manage.py createsuperuser
    ```

### MetaMask Setup

14. Install and configure MetaMask:
    - Install the MetaMask browser extension from [MetaMask website](https://metamask.io/download/)
    - Create or import a wallet
    - Connect to Ganache:
      - Click on networks dropdown → Add network → Add network manually
      - Network name: Ganache
      - RPC URL: http://127.0.0.1:7545
      - Chain ID: 1337
      - Currency symbol: ETH
    - Import a Ganache account:
      - Copy a private key from Ganache (with the 0x prefix)
      - In MetaMask, click on account circle → Import account → Paste private key

### Frontend Setup

15. Install Node.js dependencies:
    ```bash
    cd ../React-Healthcare-Frontend
    npm install
    ```
    
    For potential npm errors:
    - Try `npm install --legacy-peer-deps` if you encounter peer dependency issues
    - Or use `npm install --force` for stubborn dependency conflicts

### Start the Application

16. Start the backend server (in the activated virtual environment):
    ```bash
    cd ../Server
    python3 manage.py runserver
    ```

17. Start the frontend (in a separate terminal):
    ```bash
    cd ../React-Healthcare-Frontend
    npm run dev
    ```

18. Access the application:
    - Open your browser to the frontend URL (displayed in terminal, typically http://localhost:5173)
    - Connect your MetaMask wallet when prompted
    - Ensure MetaMask is connected to your Ganache network
    - You should see a login/signup page or dashboard

### Seed Database (Optional)

19. To populate the database with sample data:
    ```bash
    cd ../Server
    python3 seed_db.py
    ```

## Verification Steps

After completing the setup, verify your installation by:

1. Creating a doctor account
2. Creating a patient account
3. Scheduling an appointment
4. Confirming the appointment appears on the blockchain

You should see MetaMask prompt you to sign transactions during these operations.

## Cross-Platform Considerations

### Windows Users
- Use `venv\Scripts\activate` instead of `source venv/bin/activate`
- Use `type nul > .env` instead of `touch .env`
- You may need to run PowerShell or Command Prompt as Administrator for some operations
- If you encounter permission issues, check Windows Defender or antivirus settings

### macOS/Linux Users
- You may need to use `sudo` for some operations
- Ensure you have appropriate permissions for the project directory
- If using M1/M2 Macs, you might need Rosetta 2 for some Node.js packages

### Backend Issues

1. **Django Server Won't Start**:
   - Check Python version compatibility (3.8+ recommended)
   - Verify all dependencies are installed
   - Look for error messages in console output

2. **Database Errors**:
   - Run `python3 manage.py migrate` to ensure schema is up-to-date
   - Check database file permissions
   - For SQLite issues, try deleting db.sqlite3 and re-migrating

3. **Blockchain Connection Errors**:
   - Verify .env file has correct RPC URL and contract address
   - Ensure Ganache is running on the expected port
   - Check Web3 version compatibility

### Frontend Issues

1. **NPM Install Errors**:
   - Try `npm install --legacy-peer-deps` or `npm install --force`
   - Clear npm cache: `npm cache clean --force`
   - Verify Node.js version (16+ recommended)

2. **MetaMask Connection Issues**:
   - Ensure MetaMask is connected to Ganache network
   - Check Chain ID is set to 1337
   - Try importing a different Ganache account

3. **CORS Errors**:
   - Verify Django CORS settings allow frontend origin
   - Check that backend server is running
   - Try using the same port for development

## Clearing Data for Fresh Start

To reset the system completely:

1. Stop all running servers
2. Reset Ganache (restart or create new workspace)
3. Clear database: `cd Server && python3 manage.py flush`
4. Redeploy contract: `cd Server && python3 deploy_contract.py`
5. Update .env file with new contract address
6. Reset MetaMask account: Settings → Advanced → Reset Account
7. Re-migrate database: `python3 manage.py migrate`

## Features

- Secure blockchain-based appointment scheduling
- Patient and doctor management
- Smart contract integration for tamper-proof records
- MetaMask wallet integration
- Deposit system for appointment confirmations
- IPFS integration for storing medical records (Angular client)
- Modern React UI with Tailwind CSS (new version)

## System Architecture

- Frontend: React (latest) or Angular (legacy)
- Backend: Django, Django REST Framework
- Blockchain: Ethereum, Solidity Smart Contracts
- Storage: IPFS (InterPlanetary File System) for Angular client
- Authentication: JWT with blockchain wallet signatures

## API Endpoints

- `/api/doctors/` - Doctor CRUD operations
- `/api/patients/` - Patient CRUD operations
- `/api/appointments/` - Appointment management
- `/api/blockchain/auth/` - Blockchain wallet authentication

## Technologies Used

- **Frontend**: React 19, TypeScript, Tailwind CSS, React Router, Ethers.js
- **Backend**: Django 4.0, Django REST Framework, Web3.py
- **Blockchain**: Ethereum, Solidity, Ganache, MetaMask
- **Authentication**: JWT with blockchain signatures
