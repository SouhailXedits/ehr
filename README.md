# EHR Blockchain System

A secure Electronic Health Record system using blockchain technology to manage patient records, appointments, and medical data.

## Complete Setup Guide for React Frontend (Latest Version)

### Prerequisites
- Python 3.8+ 
- Node.js 16+
- Git
- MetaMask browser extension
- Ganache (local Ethereum blockchain)

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
   ```

### Smart Contract Setup

4. Install and set up Ganache:
   - Download and install Ganache from https://trufflesuite.com/ganache/
   - Launch Ganache and create a new workspace

5. Deploy the smart contract:
   ```bash
   cd ../Server/contracts
   # If you have Truffle installed:
   truffle migrate --network development
   # Or use Remix IDE to deploy AppointmentContract.sol to your Ganache network
   ```

6. Get contract address and private keys:
   - Contract address: After deployment, copy the deployed contract address
   - Private keys: From Ganache UI, click on the key icon next to any account to view its private key

### Environment Configuration

7. Create `.env` file in the Server directory

8. Add the following to `.env`:
   ```
   ETHEREUM_RPC_URL=http://localhost:8545
   APPOINTMENT_CONTRACT_ADDRESS=<contract_address_from_step_6>
   PRIVATE_KEY=<doctor_private_key_from_ganache>
   PATIENT_PRIVATE_KEY=<patient_private_key_from_ganache>
   ```

### MetaMask Setup

9. Install and configure MetaMask:
   - Install the MetaMask browser extension
   - Create or import a wallet
   - Connect to Ganache:
     - Click on networks dropdown → Add network → Add network manually
     - Network name: Ganache
     - RPC URL: http://localhost:8545
     - Chain ID: 1337
     - Currency symbol: ETH
   - Import a Ganache account:
     - Copy a private key from Ganache
     - In MetaMask, click on account circle → Import account → Paste private key

### Frontend Setup

10. Install Node.js dependencies:
    ```bash
    cd ../React-Healthcare-Frontend
    npm install
    ```

### Start the Application

11. Start the backend server (in the activated virtual environment):
    ```bash
    cd ../Server
    python manage.py migrate
    python manage.py runserver
    ```

12. Start the frontend (in a separate terminal):
    ```bash
    cd ../React-Healthcare-Frontend
    npm run dev
    ```

13. Access the application:
    - Open your browser to the frontend URL (typically http://localhost:3000)
    - Connect your MetaMask wallet when prompted
    - Ensure MetaMask is connected to your Ganache network
